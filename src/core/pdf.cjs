'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const PDFDocument = require('pdfkit');
const { writeText } = require('./text-formats.cjs');
async function textPDF(text, { pages, landscape = false } = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: landscape ? 'landscape' : 'portrait', margin: 48, info: { Producer: 'Peeler', Creator: 'Peeler' } });
    const chunks = []; doc.on('data', chunk => chunks.push(chunk)); doc.on('error', reject); doc.on('end', () => resolve(Buffer.concat(chunks)));
    try {
      doc.font(require.resolve('pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf')).fontSize(11);
      for (const [index, page] of (pages || [text]).entries()) { if (index) doc.addPage(); doc.text(page || ' ', { lineGap: 4 }); }
      doc.end();
    } catch (error) { doc.destroy(); reject(error); }
  });
}
async function openPDF(input) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const root = path.dirname(require.resolve('pdfjs-dist/package.json')).replace(/\\/g, '/');
  const task = pdfjs.getDocument({ data: new Uint8Array(await fs.readFile(input)), isEvalSupported: false, useSystemFonts: false, standardFontDataUrl: `${root}/standard_fonts/`, cMapUrl: `${root}/cmaps/`, cMapPacked: true, wasmUrl: `${root}/wasm/` });
  const doc = await task.promise;
  if (doc.numPages > 200) { await doc.loadingTask.destroy(); throw new Error('PDFs are limited to 200 pages per job.'); }
  return doc;
}
async function pdfText(doc) {
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map(item => `${item.str || ''}${item.hasEOL ? '\n' : ' '}`).join('').trim());
  }
  const text = pages.join('\n\n');
  if (!text.trim()) throw new Error('This PDF has no selectable text. OCR is not available yet; choose a page-image export.');
  return text;
}
async function renderPage(doc, number, format = 'png', dpi = 300) {
  const { createCanvas } = require('@napi-rs/canvas');
  const page = await doc.getPage(number), viewport = page.getViewport({ scale: dpi / 72 });
  if (viewport.width * viewport.height > 40_000_000) throw new Error('PDF page exceeds the 40 megapixel rendering limit.');
  // Exact DPI dimensions can land just above an integer due to floating-point noise.
  const canvas = createCanvas(Math.ceil(viewport.width - 1e-8), Math.ceil(viewport.height - 1e-8));
  await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: '#ffffff' }).promise;
  const data = await canvas.encode(format === 'jpg' ? 'jpeg' : 'png');
  canvas.width = 1; canvas.height = 1; page.cleanup();
  return { data, width: viewport.width, height: viewport.height };
}
async function convertPDF({ input, format, temporary }, { onProgress } = {}) {
  const doc = await openPDF(input);
  try {
    if (['png', 'jpg'].includes(format)) {
      const entries = []; let bytes = 0;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await renderPage(doc, i, format); bytes += page.data.length;
        if (bytes > 200_000_000) throw new Error('Rendered pages exceed 200 MB.');
        entries.push({ name: `page-${String(i).padStart(3, '0')}.${format}`, data: page.data }); onProgress?.({ phase: 'Rendering pages', current: i, total: doc.numPages });
      }
      await fs.writeFile(temporary, await require('./archives.cjs').writeArchive(entries, 'zip'), { flag: 'wx' });
    } else if (format === 'pptx') {
      const Presentation = require('pptxgenjs'), presentation = new Presentation();
      const first = (await doc.getPage(1)).getViewport({ scale: 1 });
      presentation.defineLayout({ name: 'PDF', width: first.width / 72, height: first.height / 72 }); presentation.layout = 'PDF';
      let total = 0;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await renderPage(doc, i, 'png', 144); total += page.data.length;
        if (total > 200_000_000) throw new Error('Rendered slides exceed 200 MB.');
        const scale = Math.min(first.width / page.width, first.height / page.height) / 72;
        const w = page.width * scale, h = page.height * scale;
        presentation.addSlide().addImage({ data: `image/png;base64,${page.data.toString('base64')}`, x: (first.width / 72 - w) / 2, y: (first.height / 72 - h) / 2, w, h });
        onProgress?.({ phase: 'Creating slides', current: i, total: doc.numPages });
      }
      await fs.writeFile(temporary, await presentation.write({ outputType: 'nodebuffer' }), { flag: 'wx' });
    } else {
      const text = await pdfText(doc); await fs.writeFile(temporary, await writeText(text, format, path.basename(input, '.pdf')), { flag: 'wx' });
    }
  } finally { await doc.loadingTask.destroy(); }
}
async function imagePDF(buffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false }), chunks = [];
    doc.on('data', chunk => chunks.push(chunk)); doc.on('error', reject); doc.on('end', () => resolve(Buffer.concat(chunks)));
    try { const image = doc.openImage(buffer); const scale = Math.min(1, 14000 / Math.max(image.width, image.height)); doc.addPage({ size: [image.width * scale, image.height * scale], margin: 0 }); doc.image(image, 0, 0, { width: image.width * scale }); doc.end(); }
    catch (error) { doc.destroy(); reject(error); }
  });
}
module.exports = { textPDF, imagePDF, openPDF, pdfText, renderPage, convertPDF };
