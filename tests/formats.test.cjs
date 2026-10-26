'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { convert, capabilities } = require('../src/core/converter.cjs');
const { readZip, readArchive, writeArchive } = require('../src/core/archives.cjs');
const { runFFmpeg, available } = require('../src/core/media.cjs');
const { openPDF, pdfText } = require('../src/core/pdf.cjs');
const { readDocument, readSlides, writeText } = require('../src/core/text-formats.cjs');
const { readWorkbook } = require('../src/core/spreadsheets.cjs');
async function fixture(t) {
  await fs.mkdir(path.join(__dirname, '../.tmp'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(__dirname, '../.tmp/formats-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })); return directory;
}
async function textFromPDF(file) { const doc = await openPDF(file); try { return await pdfText(doc); } finally { await doc.loadingTask.destroy(); } }
test('capability registry covers all ten categories without inventing unavailable legacy imports', () => {
  const names = ['photo.png', 'clip.mp4', 'song.wav', 'report.pdf', 'notes.docx', 'talk.pptx', 'table.xlsx', 'book.epub', 'captions.srt', 'files.zip'];
  assert.equal(new Set(names.map(name => capabilities(name).category)).size, 10);
  for (const name of ['notes.pages']) assert.equal(capabilities(name).targets.length, 0);
  assert(capabilities('files.rar').targets.includes('zip'));
  for (const name of ['old.ppt', 'old.xls']) assert.equal(capabilities(name).targets.length > 0, require('../src/core/office.cjs').available());
  assert(capabilities('photo.heic').targets.includes('png'));
  assert(available(), 'The FFmpeg dependency must be installed for the media integration tests.');
});
test('documents convert to real DOCX, PDF, EPUB, HTML and text with readable content', async t => {
  const directory = await fixture(t), input = path.join(directory, 'notes.md');
  await fs.writeFile(input, '# Research notes\n\nCafé & tea.\n\nA second paragraph.');
  const original = await fs.readFile(input);
  for (const target of ['docx', 'pdf', 'epub', 'html', 'txt']) {
    const { output } = await convert({ input, target });
    const text = target === 'pdf' ? await textFromPDF(output) : await readDocument(output, target);
    assert.match(text, /Café & tea\./); assert.match(text, /second paragraph/);
  }
  assert.deepEqual(await fs.readFile(input), original);
});
test('EPUB follows spine order rather than archive filename order', async t => {
  const directory = await fixture(t), input = path.join(directory, 'book.epub');
  const JSZip = require('jszip'), zip = new JSZip();
  zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="book/package.opf"/></rootfiles></container>');
  zip.file('book/package.opf', '<package><manifest><item id="z" href="z.xhtml"/><item id="a" href="a.xhtml"/></manifest><spine><itemref idref="z"/><itemref idref="a"/></spine></package>');
  zip.file('book/a.xhtml', '<html><body><p>Second chapter</p></body></html>'); zip.file('book/z.xhtml', '<html><body><p>First chapter</p></body></html>');
  await fs.writeFile(input, await zip.generateAsync({ type: 'nodebuffer' }));
  const { output } = await convert({ input, target: 'txt' });
  assert.equal((await fs.readFile(output, 'utf8')).trim(), 'First chapter\n\nSecond chapter');
});
test('PDF extracts text, renders every page and exports raster slides', async t => {
  const directory = await fixture(t), input = path.join(directory, 'report.pdf');
  await fs.writeFile(input, await require('../src/core/pdf.cjs').textPDF('', { pages: ['First page content', 'Second page content'] }));
  for (const target of ['txt', 'md', 'docx', 'epub', 'png', 'jpg', 'pptx']) {
    const { output } = await convert({ input, target });
    if (['png', 'jpg'].includes(target)) {
      const pages = await readZip(await fs.readFile(output)); assert.equal(pages.length, 2);
      const meta = await require('sharp')(pages[0].data).metadata(); assert(meta.width > 2400); assert(meta.height > 3400);
    } else if (target === 'pptx') {
      const entries = await readZip(await fs.readFile(output)); assert.equal(entries.filter(entry => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name)).length, 2);
      assert.equal(entries.filter(entry => /^ppt\/media\//.test(entry.name) && !entry.directory).length, 2);
    } else { const text = await readDocument(output, target); assert.match(text, /First page content/); assert.match(text, /Second page content/); }
  }
});
test('slides export text in actual presentation order with limits disclosed', async t => {
  const directory = await fixture(t), input = path.join(directory, 'talk.pptx');
  const Presentation = require('pptxgenjs'), presentation = new Presentation();
  presentation.addSlide().addText('Opening slide', { x: 1, y: 1, w: 5, h: 1 }); presentation.addSlide().addText('Closing slide', { x: 1, y: 1, w: 5, h: 1 });
  await fs.writeFile(input, await presentation.write({ outputType: 'nodebuffer' }));
  assert.deepEqual(await readSlides(input), ['Opening slide', 'Closing slide']);
  const { output } = await convert({ input, target: 'pdf' });
  const text = await textFromPDF(output); assert.match(text, /Opening slide/); assert.match(text, /Closing slide/);
  assert.match(capabilities(input).note, require('../src/core/office.cjs').available() ? /Office rendering/ : /Text-only/);
});
test('spreadsheets roundtrip quoted CSV/TSV and XLSX values, export PDF, and refuse silent sheet loss', async t => {
  const directory = await fixture(t), input = path.join(directory, 'budget.csv');
  await fs.writeFile(input, 'Name,Value\r\n"Tea, green",12\r\nCoffee,8\r\n');
  const workbook = await convert({ input, target: 'xlsx' });
  const [sheet] = await readWorkbook(workbook.output, 'xlsx'); assert.deepEqual(sheet.rows, [['Name', 'Value'], ['Tea, green', '12'], ['Coffee', '8']]);
  const tsv = await convert({ input: workbook.output, target: 'tsv' }); assert.match(await fs.readFile(tsv.output, 'utf8'), /Tea, green\t12/);
  const pdf = await convert({ input: workbook.output, target: 'pdf' }); assert.match(await textFromPDF(pdf.output), /Coffee/);
  const Excel = require('exceljs'), book = new Excel.Workbook(); book.addWorksheet('One').addRow(['first']); book.addWorksheet('Two').addRow(['second']);
  const multi = path.join(directory, 'multi.xlsx'); await book.xlsx.writeFile(multi);
  await assert.rejects(convert({ input: multi, target: 'csv' }), /multiple sheets/);
});
test('ODS imports values into XLSX', async t => {
  const directory = await fixture(t), input = path.join(directory, 'sheet.ods');
  const JSZip = require('jszip'), zip = new JSZip(); zip.file('content.xml', '<office:document-content xmlns:office="urn:o" xmlns:table="urn:t" xmlns:text="urn:x"><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell office:value="42" office:value-type="float"/><table:table-cell><text:p>Tea &amp; coffee</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>');
  await fs.writeFile(input, await zip.generateAsync({ type: 'nodebuffer' }));
  const { output } = await convert({ input, target: 'xlsx' }); assert.deepEqual((await readWorkbook(output, 'xlsx'))[0].rows, [[42, 'Tea & coffee']]);
});
test('archives preserve files across ZIP/TAR/GZIP and reject traversal and links', async t => {
  const directory = await fixture(t), input = path.join(directory, 'files.zip');
  const entries = [{ name: 'notes/', directory: true, data: Buffer.alloc(0) }, { name: 'notes/hello.txt', data: Buffer.from('Hello archive') }];
  await fs.writeFile(input, await writeArchive(entries, 'zip'));
  for (const target of ['tar', 'gz']) {
    const { output } = await convert({ input, target });
    const unpacked = await readArchive(await fs.readFile(output), target, path.basename(output));
    assert.equal(unpacked.find(entry => entry.name === 'notes/hello.txt').data.toString(), 'Hello archive');
    const back = await convert({ input: output, target: 'zip' }); assert.equal((await readZip(await fs.readFile(back.output))).find(entry => entry.name === 'notes/hello.txt').data.toString(), 'Hello archive');
  }
  const JSZip = require('jszip'), unsafe = new JSZip(); unsafe.file('../escape.txt', 'bad');
  await assert.rejects(readZip(await unsafe.generateAsync({ type: 'nodebuffer' })), /invalid relative path|unsafe/i);
  const malicious = new JSZip(); malicious.file('link', 'target', { unixPermissions: 0o120777 });
  await assert.rejects(readZip(await malicious.generateAsync({ type: 'nodebuffer', platform: 'UNIX' })), /symbolic links/);
});
test('audio actually encodes and decodes every offered output', async t => {
  const directory = await fixture(t), input = path.join(directory, 'tone.wav');
  await runFFmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.3', '-f', 'wav', input]);
  for (const target of capabilities(input).targets) {
    const result = await convert({ input, target }); assert(result.bytes > 20);
    await runFFmpeg(['-i', result.output, '-f', 'null', '-']);
  }
});
test('video transcodes every offered container, exports GIF, and extracts real MP3', async t => {
  const directory = await fixture(t), input = path.join(directory, 'clip.mp4');
  await runFFmpeg(['-f', 'lavfi', '-i', 'testsrc=size=64x48:rate=6', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '0.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-f', 'mp4', input]);
  for (const target of capabilities(input).targets) {
    const result = await convert({ input, target }); assert(result.bytes > 20);
    await runFFmpeg(['-i', result.output, '-f', 'null', '-']);
  }
});
test('SVG, BMP and image-to-PDF produce decodable outputs', async t => {
  const directory = await fixture(t), input = path.join(directory, 'drawing.svg');
  await fs.writeFile(input, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" fill="red"/></svg>');
  const bmp = await convert({ input, target: 'bmp' }); const png = await convert({ input: bmp.output, target: 'png' });
  const image = await require('sharp')(await fs.readFile(png.output)).raw().toBuffer({ resolveWithObject: true });
  assert.equal(image.info.width, 24); assert.equal(image.data[0], 255); assert.equal(image.data[1], 0); assert.equal(image.data[2], 0);
  const pdf = await convert({ input, target: 'pdf' }); const doc = await openPDF(pdf.output); assert.equal(doc.numPages, 1); await doc.loadingTask.destroy();
});
test('cancellation and deadline stop workers and leave no partial outputs', async t => {
  const directory = await fixture(t), input = path.join(directory, 'notes.txt'); await fs.writeFile(input, 'Some notes');
  const controller = new AbortController(); const promise = convert({ input, target: 'pdf', signal: controller.signal }); setTimeout(() => controller.abort(), 10);
  await assert.rejects(promise, /cancelled/); assert.deepEqual(await fs.readdir(directory), ['notes.txt']);
  await assert.rejects(require('../src/core/jobs.cjs').runJob({ input, category: 'Documents', format: 'pdf', temporary: path.join(directory, 'timeout.tmp') }, { timeoutMs: 1 }), /time limit/);
});
