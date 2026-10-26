'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { convert, capabilities } = require('../src/core/converter.cjs');
const { available, officeExport } = require('../src/core/office.cjs');
const { openPDF, pdfText, renderPage } = require('../src/core/pdf.cjs');
const { readZip, readArchive } = require('../src/core/archives.cjs');
const { readDocument } = require('../src/core/text-formats.cjs');
const { readWorkbook, writeWorkbook } = require('../src/core/spreadsheets.cjs');
async function fixture(t) {
  await fs.mkdir(path.join(__dirname, '../.tmp'), { recursive: true });
  const dir = await fs.mkdtemp(path.join(__dirname, '../.tmp/office-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })); return dir;
}
test('RTF retains final paragraphs, code-page characters, and rejects active fields', async t => {
  const dir = await fixture(t), input = path.join(dir, 'notes.rtf');
  await fs.writeFile(input, Buffer.from("{\\rtf1\\ansi\\ansicpg1252 First\\par Caf\\'e9 & tea. Final paragraph.}", 'latin1'));
  assert.match(await readDocument(input, 'rtf'), /First\s+Café & tea\. Final paragraph\./);
  for (const target of ['txt', 'docx', 'epub']) { const result = await convert({ input, target }); assert.match(await readDocument(result.output, target), /Final paragraph/); }
  await fs.writeFile(input, '{\\rtf1{\\field malicious}}'); await assert.rejects(readDocument(input, 'rtf'), /fields/);
});
test('ODS preserves typed values, Unicode and literal entity-like strings', async t => {
  const dir = await fixture(t), input = path.join(dir, 'data.ods');
  const rows = [['Café', 'Line\nbreak', 'Tab\there', '&#9;', '  spaces  '], [12.5, true, false, '', 0]];
  await fs.writeFile(input, await writeWorkbook([{ name: 'One', rows }, { name: 'Two', rows: [['Second sheet']] }], 'ods'));
  assert.deepEqual((await readWorkbook(input, 'ods'))[0].rows, rows);
  const output = await convert({ input, target: 'xlsx' }); assert.deepEqual((await readWorkbook(output.output, 'xlsx'))[0].rows, rows);
  await assert.rejects(convert({ input, target: 'csv' }), /multiple sheets/);
  if (available()) {
    const result = await officeExport(input, 'xlsx', path.join(dir, 'independent-reader')), parsed = await readWorkbook(result, 'xlsx');
    assert.deepEqual(parsed[0].rows[0], rows[0]); assert.equal(parsed.length, 2);
    // LibreOffice's XLSX exporter represents Calc logical cells as numeric 1/0.
    assert.deepEqual(parsed[0].rows[1], [12.5, 1, 0, '', 0]);
  }
});
test('RAR5 repacking preserves bytes and rejects links, encryption, and truncation', async t => {
  const dir = await fixture(t), input = path.join(dir, 'download.rar'), { rarFixture } = require('./fixture-data.cjs');
  const original = rarFixture('test_read_format_rar5_compressed'); await fs.writeFile(input, original);
  for (const target of capabilities(input).targets) {
    const output = await convert({ input, target }), entries = await readArchive(await fs.readFile(output.output), target, path.basename(output.output));
    assert.equal(entries.length, 1); assert.equal(entries[0].name, 'test.bin'); assert.equal(entries[0].data.length, 1200);
    assert.equal(require('node:crypto').createHash('sha256').update(entries[0].data).digest('hex'), '588870a2dade35c2650fbb7898c9a9c7f21fce7c281198604e8d0c9737f2c375');
  }
  assert.deepEqual(await fs.readFile(input), original);
  for (const name of ['test_read_format_rar', 'test_read_format_rar5_hardlink', 'test_read_format_rar5_encrypted']) await assert.rejects(readArchive(rarFixture(name), 'rar'), /links|Encrypted/);
  await assert.rejects(readArchive(original.subarray(0, 100), 'rar'));
});
test('Office retains slide geometry and embedded document images in PDFs', { skip: !available(), timeout: 120000 }, async t => {
  const dir = await fixture(t), input = path.join(dir, 'illustrated.pptx');
  const Presentation = require('pptxgenjs'), slides = new Presentation(); slides.layout = 'LAYOUT_WIDE';
  const slide = slides.addSlide(); slide.addShape(slides.ShapeType.rect, { x: 1, y: 1, w: 2, h: 2, fill: { color: 'FF0000' }, line: { color: 'FF0000' } }); slide.addText('Illustrated slide', { x: 4, y: 1, w: 5, h: 1 });
  slides.addSlide().addText('Second slide', { x: 1, y: 1, w: 5, h: 1 });
  const original = await slides.write({ outputType: 'nodebuffer' }); await fs.writeFile(input, original);
  const pdf = await convert({ input, target: 'pdf' }), doc = await openPDF(pdf.output);
  try {
    assert.equal(doc.numPages, 2); assert.match(await pdfText(doc), /Illustrated slide/);
    const page = await renderPage(doc, 1, 'png', 72), { data, info } = await sharp(page.data).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const offset = (108 * info.width + 108) * info.channels; assert(data[offset] > 240 && data[offset + 1] < 20 && data[offset + 2] < 20, `The red shape at its original slide position was lost: ${data.subarray(offset, offset + 3)}`);
  } finally { await doc.loadingTask.destroy(); }
  const pages = await convert({ input, target: 'png' }); assert.equal((await readZip(await fs.readFile(pages.output))).length, 2);
  const { Document, Packer, Paragraph, TextRun, ImageRun } = require('docx'), image = await sharp({ create: { width: 100, height: 80, channels: 3, background: 'red' } }).png().toBuffer();
  const document = path.join(dir, 'report.docx');
  await fs.writeFile(document, await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun({ text: 'Styled report', bold: true, size: 48 })] }), new Paragraph({ children: [new ImageRun({ data: image, type: 'png', transformation: { width: 100, height: 80 } })] })] }] })));
  const rendered = await convert({ input: document, target: 'pdf' }), report = await openPDF(rendered.output);
  try { assert.match(await pdfText(report), /Styled report/); const page = await renderPage(report, 1, 'png', 72), stats = await sharp(page.data).stats(); assert(stats.channels[1].mean < stats.channels[0].mean - 1, 'Embedded red image was lost.'); }
  finally { await report.loadingTask.destroy(); }
  assert.deepEqual(await fs.readFile(input), original); assert(!(await fs.readdir(dir)).some(name => name.startsWith('.peeler-')));
});
test('Office cancellation removes its process tree and working profile', { skip: !available(), timeout: 30000 }, async t => {
  const dir = await fixture(t), input = path.join(dir, 'large.pptx'), Presentation = require('pptxgenjs'), slides = new Presentation();
  for (let i = 0; i < 30; i++) slides.addSlide().addText(`Page ${i}`, { x: 1, y: 1, w: 5, h: 1 });
  const original = await slides.write({ outputType: 'nodebuffer' }); await fs.writeFile(input, original);
  const controller = new AbortController(); let started = false;
  const promise = convert({ input, target: 'pdf', signal: controller.signal, onProgress: progress => { if (progress.phase.includes('Office')) { started = true; controller.abort(); } } });
  await assert.rejects(promise, /cancelled/); assert(started); assert.deepEqual(await fs.readFile(input), original); assert.deepEqual(await fs.readdir(dir), ['large.pptx']);
});
