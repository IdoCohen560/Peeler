'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp'); sharp.cache({ files: 0 });
async function runAdapter(job, options = {}) {
  const { input, format, temporary, category, operation } = job;
  const extension = path.extname(input).slice(1).toLowerCase();
  if (['Audio', 'Video'].includes(category)) return require('./media.cjs').convertMedia(job, options);
  if (category === 'Images') {
    let image;
    if (extension === 'heic') {
      const images = await require('heic-decode').all({ buffer: await fs.readFile(input) });
      try {
        const first = images[0];
        if (!first || first.width < 1 || first.height < 1 || first.width * first.height > 80_000_000) throw new Error('HEIC image exceeds the 80 megapixel limit.');
        const decoded = await first.decode();
        image = sharp(Buffer.from(decoded.data), { raw: { width: decoded.width, height: decoded.height, channels: 4 } });
      } finally { images.dispose(); }
    } else if (extension === 'bmp') {
      const buffer = await fs.readFile(input);
      if (buffer.length < 54 || buffer.toString('ascii', 0, 2) !== 'BM') throw new Error('Invalid BMP image.');
      const width = buffer.readInt32LE(18), height = Math.abs(buffer.readInt32LE(22));
      if (width < 1 || height < 1 || width * height > 80_000_000) throw new Error('Image pixel limit exceeded.');
      const decoded = require('bmp-js').decode(buffer);
      if (decoded.width * decoded.height > 80_000_000) throw new Error('Image pixel limit exceeded.');
      // bmp-js returns ABGR; Sharp expects RGBA.
      for (let i = 0; i < decoded.data.length; i += 4) { const b = decoded.data[i + 1], g = decoded.data[i + 2], r = decoded.data[i + 3]; decoded.data[i] = r; decoded.data[i + 1] = g; decoded.data[i + 2] = b; decoded.data[i + 3] = 255; }
      image = sharp(decoded.data, { raw: { width: decoded.width, height: decoded.height, channels: 4 } });
    } else {
      if (extension === 'svg') { const svg = await fs.readFile(input, 'utf8'); if (/<!ENTITY|<!DOCTYPE|@import|(?:href|src)\s*=\s*["']\s*(?!#)|url\s*\(\s*["']?(?!#)/i.test(svg)) throw new Error('SVG external references are not supported.'); }
      image = sharp(input, { limitInputPixels: 80_000_000, animated: false });
    }
    image = image.rotate();
    const settings = job.imageOptions || {};
    if (settings.width || settings.height) image = image.resize({ width: settings.width, height: settings.height, fit: 'inside', withoutEnlargement: true });
    if (['jpg', 'bmp'].includes(format)) image = image.flatten({ background: settings.background || '#ffffff' });
    if (format === 'pdf') await fs.writeFile(temporary, await require('./pdf.cjs').imagePDF(await image.png().toBuffer()), { flag: 'wx' });
    else if (format === 'bmp') {
      const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) { const r = data[i], g = data[i + 1], b = data[i + 2]; data[i] = 0; data[i + 1] = b; data[i + 2] = g; data[i + 3] = r; }
      await fs.writeFile(temporary, require('bmp-js').encode({ data, width: info.width, height: info.height }).data, { flag: 'wx' });
    } else await image.toFormat(format, { quality: settings.quality || 85 }).toFile(temporary);
    return;
  }
  if (category === 'PDF') return require('./pdf.cjs').convertPDF(job, options);
  if (['Documents', 'EPUB'].includes(category)) {
    if (['docx', 'rtf'].includes(extension) && ['pdf', 'png', 'jpg'].includes(format) && require('./office.cjs').available()) return require('./office.cjs').renderOffice(job, options);
    const { readDocument, writeText } = require('./text-formats.cjs');
    const text = await readDocument(input, extension);
    if (['png', 'jpg'].includes(format)) {
      const work = job.workDirectory;
      const pdf = path.join(work, 'pages.pdf'); await fs.writeFile(pdf, await require('./pdf.cjs').textPDF(text), { flag: 'wx' });
      return require('./pdf.cjs').convertPDF({ input: pdf, format, temporary }, options);
    }
    const data = format === 'pdf' ? await require('./pdf.cjs').textPDF(text) : await writeText(text, format, path.basename(input, path.extname(input)));
    return fs.writeFile(temporary, data, { flag: 'wx' });
  }
  if (category === 'Slides') {
    if (require('./office.cjs').available()) return require('./office.cjs').renderOffice(job, options);
    const pages = await require('./text-formats.cjs').readSlides(input);
    if (!pages.length || !pages.some(page => page.trim())) throw new Error('No slide text found. Graphic-only slides cannot be exported by the text-only slide adapter.');
    return fs.writeFile(temporary, await require('./pdf.cjs').textPDF('', { pages, landscape: true }), { flag: 'wx' });
  }
  if (category === 'Spreadsheets') {
    const office = require('./office.cjs');
    if (['xls', 'xlsx', 'ods'].includes(extension) && format === 'pdf' && office.available()) return office.renderOffice(job, options);
    let source = input, sourceExtension = extension;
    if (extension === 'xls') { source = await office.officeExport(input, 'xlsx', job.workDirectory, options); sourceExtension = 'xlsx'; }
    const { readWorkbook, writeWorkbook } = require('./spreadsheets.cjs');
    return fs.writeFile(temporary, await writeWorkbook(await readWorkbook(source, sourceExtension), format), { flag: 'wx' });
  }
  if (category === 'Subtitles') {
    const result = require('./subtitles.cjs').convertSubtitles(await fs.readFile(input, 'utf8'), format);
    return fs.writeFile(temporary, result, { flag: 'wx' });
  }
  if (category === 'Archives') {
    const { readArchive, writeArchive } = require('./archives.cjs');
    const entries = await readArchive(await fs.readFile(input), extension === 'tgz' ? 'gz' : extension, path.basename(input));
    return fs.writeFile(temporary, await writeArchive(entries, format), { flag: 'wx' });
  }
  throw new Error(`No adapter for ${category}.`);
}
module.exports = { runAdapter };
