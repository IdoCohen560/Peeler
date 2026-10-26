'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');
const sharp = require('sharp'); sharp.cache({ files: 0 });
const { capabilities, convert } = require('../src/core/converter.cjs');
const { audio, video, runFFmpeg, ffmpegPath } = require('../src/core/media.cjs');
const { readDocument } = require('../src/core/text-formats.cjs');
const { openPDF, pdfText } = require('../src/core/pdf.cjs');
const { readWorkbook } = require('../src/core/spreadsheets.cjs');
const { readZip, readArchive, writeArchive } = require('../src/core/archives.cjs');
const { parseSubtitles } = require('../src/core/subtitles.cjs');
const JSZip = require('jszip');
const root = path.join(__dirname, '..');
const fixtures = [];
const text = 'Café & tea. Second paragraph.';
const rows = [['Item', 'Value'], ['Tea, green', '12'], ['Coffee\tblend', '8'], ['Line\nbreak', '7'], ['Café & tea', '3']];
const normalize = value => String(value).replace(/\s+/g, ' ').trim();
async function main() {
  await fs.mkdir(path.join(root, '.tmp'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, '.tmp/conversion-audit-'));
  const inputs = path.join(directory, 'inputs'); await fs.mkdir(inputs);
  async function fixture(name, data, validator, referenceInput) {
    const input = path.join(inputs, name); await fs.writeFile(input, data);
    fixtures.push({ input, validator, referenceInput: referenceInput || path.extname(name).slice(1) }); return input;
  }
  async function documentValidator(output, target) {
    if (['png', 'jpg'].includes(target)) {
      const pages = await readZip(await fs.readFile(output)); assert(pages.length > 0);
      for (const page of pages) { const image = sharp(page.data), metadata = await image.metadata(), stats = await image.stats(); assert(metadata.width > 1000 && metadata.height > 1000); assert(stats.channels.some(channel => channel.min < 100), 'Rendered page is blank.'); }
      return;
    }
    let actual;
    if (target === 'pdf') { const doc = await openPDF(output); try { actual = await pdfText(doc); } finally { await doc.loadingTask.destroy(); } }
    else actual = await readDocument(output, target);
    assert(normalize(actual).includes(text), 'Document text was lost or changed.');
  }
  async function imageValidator(output, target) {
    if (target === 'pdf') { const doc = await openPDF(output); try { assert.equal(doc.numPages, 1); const viewport = (await doc.getPage(1)).getViewport({ scale: 1 }); assert.equal(viewport.width, 64); assert.equal(viewport.height, 48); } finally { await doc.loadingTask.destroy(); } return; }
    if (target === 'bmp') { const result = require('bmp-js').decode(await fs.readFile(output)); assert.equal(result.width, 64); assert.equal(result.height, 48); assert(result.data[3] > 230 && result.data[1] < 30 && result.data[2] < 30, 'BMP pixel colors changed.'); return; }
    const result = await sharp(await fs.readFile(output)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(result.info.width, 64); assert.equal(result.info.height, 48);
    assert(result.data[0] > 230 && result.data[1] < 30 && result.data[2] < 30, 'Image pixel colors changed.');
  }
  async function decode(file, args) {
    const result = await promisify(execFile)(ffmpegPath(), ['-hide_banner', '-loglevel', 'error', '-protocol_whitelist', 'file,pipe', '-i', file, ...args, 'pipe:1'], { encoding: 'buffer', maxBuffer: 2_000_000, windowsHide: true, timeout: 30000 });
    return result.stdout;
  }
  async function mediaValidator(output, target) {
    if (Object.hasOwn(audio, target)) {
      const pcm = await decode(output, ['-map', '0:a:0', '-vn', '-ar', '16000', '-ac', '1', '-t', '0.1', '-f', 's16le']);
      assert(pcm.length > 1000, 'Audio did not decode to the expected samples.'); let peak = 0;
      for (let i = 0; i + 1 < pcm.length; i += 2) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i)));
      assert(peak > 100, 'The converted test tone is silent.');
    } else {
      const pixels = await decode(output, ['-map', '0:v:0', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24']);
      assert.equal(pixels.length, 64 * 48 * 3); assert(pixels[0] > 200 && pixels[1] < 40 && pixels[2] < 40, 'Video frame contents changed.');
    }
  }
  // Independent source fixtures, with aliases and container variants covered too.
  for (const extension of ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'avif']) {
    const format = { jpg: 'jpeg', tif: 'tiff' }[extension] || extension;
    await fixture(`image.${extension}`, await sharp({ create: { width: 64, height: 48, channels: 3, background: 'red' } }).toFormat(format).toBuffer(), imageValidator);
  }
  await fixture('image.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><rect width="64" height="48" fill="red"/></svg>', imageValidator);
  const bmp = Buffer.alloc(64 * 48 * 4); for (let i = 0; i < bmp.length; i += 4) bmp[i + 3] = 255;
  await fixture('image.bmp', require('bmp-js').encode({ data: bmp, width: 64, height: 48 }).data, imageValidator);
  for (const [extension, args] of Object.entries(audio)) {
    const input = path.join(inputs, `audio.${extension}`);
    await runFFmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.5', ...args, input]);
    fixtures.push({ input, validator: mediaValidator, referenceInput: extension });
  }
  for (const extension of Object.keys(video)) {
    const input = path.join(inputs, `video.${extension}`);
    const args = ['-f', 'lavfi', '-i', 'color=red:size=64x48:rate=6'];
    if (extension !== 'gif') args.push('-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100');
    args.push('-t', '0.5', ...video[extension], input); await runFFmpeg(args);
    fixtures.push({ input, validator: mediaValidator, referenceInput: extension });
  }
  await fixture('document.txt', text, documentValidator);
  await fixture('document.md', `# Report\n\n${text}`, documentValidator);
  await fixture('document.html', `<html><body><h1>Report</h1><p>Café &amp; tea. Second paragraph.</p></body></html>`, documentValidator);
  await fixture('document.rtf', '{\\rtf1\\ansi\\ansicpg1252 Report\\par Caf\\\'e9 & tea. Second paragraph.}', documentValidator);
  const { Document, Packer, Paragraph } = require('docx');
  await fixture('document.docx', await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph('Report'), new Paragraph(text)] }] })), documentValidator);
  const book = new JSZip(); book.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  book.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="book/content.opf"/></rootfiles></container>');
  book.file('book/content.opf', '<package><manifest><item id="first" href="z.xhtml"/><item id="last" href="a.xhtml"/></manifest><spine><itemref idref="first"/><itemref idref="last"/></spine></package>');
  book.file('book/a.xhtml', '<html><body><p>Last chapter.</p></body></html>'); book.file('book/z.xhtml', `<html><body><p>${text.replace('&', '&amp;')}</p></body></html>`);
  await fixture('book.epub', await book.generateAsync({ type: 'nodebuffer' }), async (output, target) => { await documentValidator(output, target); });
  const PDF = require('pdfkit');
  const pdf = await new Promise((resolve, reject) => { const document = new PDF({ size: 'LETTER', margin: 40 }), chunks = []; document.on('data', chunk => chunks.push(chunk)); document.on('error', reject); document.on('end', () => resolve(Buffer.concat(chunks))); document.font(require.resolve('pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf')); document.text(text); document.addPage().text('Second PDF page.'); document.end(); });
  await fixture('pages.pdf', pdf, async (output, target) => {
    if (['png', 'jpg'].includes(target)) { const entries = await readZip(await fs.readFile(output)); assert.equal(entries.length, 2); for (const entry of entries) { const meta = await sharp(entry.data).metadata(); assert.equal(meta.width, 2550); assert.equal(meta.height, 3300); } }
    else if (target === 'pptx') { const entries = await readZip(await fs.readFile(output)); assert.equal(entries.filter(entry => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name)).length, 2); assert.equal(entries.filter(entry => /^ppt\/media\//.test(entry.name) && !entry.directory).length, 2); }
    else await documentValidator(output, target);
  });
  const Presentation = require('pptxgenjs'), slides = new Presentation(); slides.addSlide().addText(text, { x: 1, y: 1, w: 8, h: 2 }); slides.addSlide().addText('Final slide.', { x: 1, y: 1, w: 8, h: 2 });
  const slideInput = await fixture('slides.pptx', await slides.write({ outputType: 'nodebuffer' }), documentValidator);
  async function sheetValidator(output, target) {
    if (target === 'pdf') { const doc = await openPDF(output); try { const actual = normalize(await pdfText(doc)); assert(actual.includes('Tea, green') && actual.includes('Café & tea'), 'Spreadsheet PDF values were lost.'); } finally { await doc.loadingTask.destroy(); } }
    else { const sheets = await readWorkbook(output, target); assert.equal(sheets.length, 1); assert.deepEqual(sheets[0].rows.map(row => row.map(String)), rows); }
  }
  const Excel = require('exceljs'), workbook = new Excel.Workbook(); workbook.addWorksheet('Data').addRows(rows);
  const sheetInput = await fixture('sheet.xlsx', Buffer.from(await workbook.xlsx.writeBuffer()), sheetValidator);
  const { stringify } = require('csv-stringify/sync');
  for (const extension of ['csv', 'tsv']) await fixture(`sheet.${extension}`, stringify(rows, { delimiter: extension === 'tsv' ? '\t' : ',' }), sheetValidator);
  await fixture('sheet.ods', await require('../src/core/spreadsheets.cjs').writeWorkbook([{ name: 'Data', rows }], 'ods'), sheetValidator);
  const office = require('../src/core/office.cjs');
  if (office.available()) {
    for (const [source, extension, validator] of [[slideInput, 'ppt', documentValidator], [sheetInput, 'xls', sheetValidator]]) {
      const exported = await office.officeExport(source, extension, path.join(directory, `legacy-${extension}`));
      await fixture(`legacy.${extension}`, await fs.readFile(exported), validator);
    }
  }
  const heicFixture = process.env.PEELER_HEIC_FIXTURE || path.join(root, '.tmp/external-fixtures/example.heic');
  if (await fs.stat(heicFixture).catch(() => null)) {
    const buffer = await fs.readFile(heicFixture), decoded = await require('heic-decode')({ buffer });
    await fixture('phone.heic', buffer, async (output, target) => {
      if (target === 'pdf') { const doc = await openPDF(output); try { assert.equal(doc.numPages, 1); } finally { await doc.loadingTask.destroy(); } }
      else { const result = target === 'bmp' ? require('bmp-js').decode(await fs.readFile(output)) : await sharp(output).metadata(); assert.equal(result.width, decoded.width); assert.equal(result.height, decoded.height); }
    });
  }
  const subtitle = '1\n00:00:01,000 --> 00:00:02,500\nHello café\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond cue\n';
  async function subtitleValidator(output, target) { const actual = await fs.readFile(output, 'utf8'); if (target === 'txt') assert.equal(actual, 'Hello café\n\nSecond cue\n'); else { const cues = parseSubtitles(actual); assert.equal(cues.length, 2); assert.equal(cues[0].start, '00:00:01.000'); assert.equal(cues[0].text, 'Hello café'); } }
  await fixture('captions.srt', subtitle, subtitleValidator);
  await fixture('captions.vtt', 'WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nHello café\n\n00:00:03.000 --> 00:00:04.000\nSecond cue\n', subtitleValidator);
  const entries = [{ name: 'folder/', directory: true, data: Buffer.alloc(0) }, { name: 'folder/Café.txt', data: Buffer.from('Archive contents') }];
  const archiveValidator = expected => async (output, target) => { const actual = await readArchive(await fs.readFile(output), target, path.basename(output)); assert.deepEqual(actual.filter(entry => !entry.directory).map(entry => [entry.name, entry.data.toString()]), expected); };
  for (const extension of ['zip', 'tar', 'gz', 'tgz']) await fixture(`archive.${extension === 'gz' ? 'tar.gz' : extension}`, await writeArchive(entries, extension === 'tgz' ? 'gz' : extension), archiveValidator([['folder/Café.txt', 'Archive contents']]), extension);
  await fixture('single.txt.gz', require('node:zlib').gzipSync(Buffer.from('Single GZIP stream')), archiveValidator([['single.txt', 'Single GZIP stream']]), 'gz-single-stream');
  await fixture('download.rar', require('../tests/fixture-data.cjs').rarFixture('test_read_format_rar5_compressed'), async (output, target) => {
    const entries = await readArchive(await fs.readFile(output), target, path.basename(output));
    assert.equal(entries.length, 1); assert.equal(entries[0].name, 'test.bin'); assert.equal(entries[0].data.length, 1200);
    assert.equal(require('node:crypto').createHash('sha256').update(entries[0].data).digest('hex'), '588870a2dade35c2650fbb7898c9a9c7f21fce7c281198604e8d0c9737f2c375');
  });
  const cases = fixtures.flatMap(f => capabilities(f.input).targets.map(target => ({ ...f, category: capabilities(f.input).category, target })));
  const results = []; let next = 0;
  console.log(`Checking ${cases.length} advertised conversions from ${fixtures.length} source fixtures, across ten categories.`);
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (next < cases.length) {
      const index = next++, item = cases[index], start = Date.now(), outputDirectory = path.join(directory, `case-${index}`); await fs.mkdir(outputDirectory);
      let result;
      try { const before = await fs.readFile(item.input); const converted = await convert({ input: item.input, target: item.target, outputDirectory }); await item.validator(converted.output, item.target); assert.deepEqual(await fs.readFile(item.input), before); result = { status: 'passed', output: path.relative(root, converted.output) }; }
      catch (error) { result = { status: 'failed', error: error.message }; }
      results.push({ category: item.category, source: path.basename(item.input), inputFormat: item.referenceInput, target: item.target, durationMs: Date.now() - start, ...result });
      if (results.length % 20 === 0 || results.length === cases.length) console.log(`Checked ${results.length}/${cases.length}; ${results.filter(value => value.status === 'failed').length} failures.`);
    }
  }));
  const inventory = require('../docs/format-inventory.json');
  const reference = inventory.categories.flatMap(category => Object.entries(category.conversions).flatMap(([input, outputs]) => outputs.map(target => ({ category: category.category, input, target }))));
  const coverage = reference.map(route => ({ ...route, status: results.find(result => result.category === route.category && result.inputFormat === route.input && result.target === route.target)?.status || (capabilities(`file.${route.input}`).targets.includes(route.target) ? 'not tested' : 'not implemented') }));
  const unsupported = ['pages', 'rtfd', 'textClipping', ...(!office.available() ? ['ppt', 'xls'] : [])].map(extension => ({ extension, correctlyUnavailable: capabilities(`file.${extension}`).targets.length === 0 }));
  const report = { checkedAt: new Date().toISOString(), platform: process.platform, architecture: process.arch, node: process.version, directory: path.relative(root, directory), passed: results.filter(result => result.status === 'passed').length, failed: results.filter(result => result.status === 'failed').length, referencePassed: coverage.filter(route => route.status === 'passed').length, referenceTotal: reference.length, referenceNotImplemented: coverage.filter(route => route.status === 'not implemented').length, unsupported, results, referenceCoverage: coverage, limits: 'Small generated fixtures; validates content/decodability and source preservation, not all complex real-world files or faithful office layout. Windows execution does not establish macOS/Linux native behavior.' };
  report.referenceNotTested = coverage.filter(route => route.status === 'not tested').length;
  report.officeEngineAvailable = office.available();
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(root, '.tmp/conversion-audit-latest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, failed: report.failed, referencePassed: report.referencePassed, referenceTotal: reference.length, referenceNotImplemented: report.referenceNotImplemented, report: path.join(directory, 'report.json') }, null, 2));
  for (const failure of results.filter(value => value.status === 'failed')) console.log(`FAIL ${failure.category} ${failure.source} -> ${failure.target}: ${failure.error}`);
  if (report.failed || report.referenceNotTested || unsupported.some(value => !value.correctlyUnavailable)) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
