'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { runJob } = require('./jobs.cjs');
const { allocateWorkspace, releaseWorkspace } = require('./workspaces.cjs');
const imageInputs = ['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff', 'avif', 'svg', 'bmp', 'heic'];
const imageOutputs = ['png', 'jpg', 'webp', 'avif', 'tiff', 'bmp', 'pdf'];
const audioFormats = ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'opus', 'aiff', 'wma'];
const videoFormats = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'wmv', 'gif'];
function capabilities(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  let category = 'Unsupported', targets = [], tools = [], note = '';
  if (imageInputs.includes(ext)) { category = 'Images'; targets = imageOutputs; tools = !['svg', 'bmp', 'heic'].includes(ext) ? ['strip-metadata'] : []; note = ext === 'heic' ? 'Primary HEIC image only, decoded locally to 8-bit SDR. HDR, depth, sequences, and original metadata are not preserved.' : 'One image or page, auto-oriented. Metadata is removed. Default quality is 85.'; }
  else if (audioFormats.includes(ext) || videoFormats.includes(ext)) {
    category = audioFormats.includes(ext) ? 'Audio' : 'Video';
    if (require('./media.cjs').available()) targets = category === 'Audio' ? audioFormats : ext === 'gif' ? videoFormats.filter(x => x !== 'gif') : [...videoFormats, 'mp3'];
    note = targets.length ? 'Re-encoded locally. Audio extraction requires an audio track; only the first video/audio stream is retained.' : 'FFmpeg is missing; reinstall app dependencies.';
  }
  else if (ext === 'pdf') { category = 'PDF'; targets = ['txt', 'md', 'docx', 'epub', 'png', 'jpg', 'pptx']; note = 'Text exports require selectable text and do not preserve layout. PNG/JPG: all pages at 300 DPI in a ZIP. PPTX: page images, not editable slide objects. OCR is not included.'; }
  else if (['docx', 'md', 'txt', 'html', 'rtf'].includes(ext)) { category = 'Documents'; targets = ['txt', 'md', 'html', 'docx', 'pdf', 'epub', 'png', 'jpg']; note = ['docx', 'rtf'].includes(ext) && require('./office.cjs').available() ? 'PDF and page images use local Office rendering; fonts may be substituted. Other exports preserve text only. PNG/JPG: all pages in a ZIP.' : 'Text-content conversion; original formatting, images, and layout are not preserved. PNG/JPG: rendered text pages in a ZIP.'; }
  else if (['ppt', 'pptx'].includes(ext)) { category = 'Slides'; const office = require('./office.cjs').available(); targets = office ? ['pdf', 'png', 'jpg'] : ext === 'pptx' ? ['pdf'] : []; note = office ? 'Local Office rendering with slide graphics and layout. Fonts may be substituted; animations are not retained. PNG/JPG: all slides in a ZIP.' : ext === 'pptx' ? 'Text-only PDF: one section per slide in presentation order. Images, graphics, animations, and original slide layout are not preserved.' : 'Legacy PPT requires the local Office engine. See docs/OFFICE_ENGINE.md.'; }
  else if (['xlsx', 'ods', 'csv', 'tsv', 'xls'].includes(ext)) { category = 'Spreadsheets'; targets = ext === 'xls' && !require('./office.cjs').available() ? [] : ['xlsx', 'ods', 'csv', 'tsv', 'pdf']; note = !targets.length ? 'Legacy XLS requires the local Office engine. See docs/OFFICE_ENGINE.md.' : 'Values only for workbook/text exports. CSV/TSV require one sheet. Office PDF rendering is used when available for XLS/XLSX/ODS; fonts and formulas may differ.'; }
  else if (ext === 'epub') { category = 'EPUB'; targets = ['txt', 'md', 'html', 'docx', 'pdf']; note = 'Text in EPUB reading order. Images and book layout are not preserved; protected/encrypted books are not supported.'; }
  else if (['srt', 'vtt'].includes(ext)) { category = 'Subtitles'; targets = ['srt', 'vtt', 'txt']; note = 'Timed cues; styling and cue settings are not preserved.'; }
  else if (['zip', 'tar', 'gz', 'tgz', 'rar'].includes(ext)) { category = 'Archives'; targets = ['zip', 'tar', 'gz']; note = 'Repack regular files/folders, including RAR input. GZIP output is tar.gz. Links, encryption, unsafe paths, and archives over 200 MB expanded are rejected.'; }
  else if (['heic', 'pages', 'rtf', 'rtfd', 'textclipping', 'ppt', 'xls', 'rar'].includes(ext)) { note = 'This format belongs to the planned product scope but its import engine is not implemented yet.'; }
  const normalized = ({ jpeg: 'jpg', tif: 'tiff', tgz: 'gz' })[ext] || ext;
  if (category === 'Images' && !['svg', 'heic'].includes(ext)) tools.push('optimize-image');
  return { category, targets: targets.filter(target => target !== normalized), tools, note };
}
async function inspect(file) {
  const absolute = path.resolve(file), stat = await fs.stat(absolute);
  if (!stat.isFile()) throw new Error('Choose individual files; folders are not supported yet.');
  const info = capabilities(absolute);
  const limit = ['Audio', 'Video'].includes(info.category) ? 4_000_000_000 : info.category === 'Subtitles' ? 10_000_000 : 100_000_000;
  if (stat.size > limit) throw new Error(`File exceeds this category's ${limit / 1_000_000} MB input limit.`);
  return { path: absolute, name: path.basename(absolute), bytes: stat.size, ...info };
}
function validateImageOptions(value, category) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !['width', 'height', 'quality', 'background'].includes(key))) throw new Error('Invalid image options.');
  if (category !== 'Images' && Object.keys(value).length) throw new Error('Image options require an image input.');
  for (const key of ['width', 'height', 'quality']) if (value[key] !== undefined && (!Number.isInteger(value[key]) || value[key] < 1 || value[key] > (key === 'quality' ? 100 : 16384))) throw new Error(`${key} must be a whole number between 1 and ${key === 'quality' ? 100 : 16384}.`);
  if (value.background !== undefined && !/^#[0-9a-f]{6}$/i.test(value.background)) throw new Error('Choose a six-digit background color.');
  return { ...value };
}
async function convert({ input, target, operation = 'convert', outputDirectory, imageOptions, signal, onProgress }) {
  if (typeof input !== 'string' || typeof target !== 'string') throw new Error('Input and target are required.');
  if (signal?.aborted) throw new Error('Conversion cancelled.');
  const info = await inspect(input), metadataOnly = operation === 'strip-metadata', imageCopy = operation === 'optimize-image';
  const validatedOptions = validateImageOptions(imageOptions, info.category);
  if (!['convert', 'strip-metadata', 'optimize-image'].includes(operation)) throw new Error('Unsupported operation.');
  if (metadataOnly || imageCopy ? !info.tools.includes(operation) : !info.targets.includes(target)) throw new Error('Unsupported conversion.');
  const ext = path.extname(input).slice(1).toLowerCase();
  const format = metadataOnly || imageCopy ? ({ jpeg: 'jpg', tif: 'tiff' }[ext] || ext) : target;
  const directory = path.resolve(outputDirectory || path.dirname(info.path));
  const base = path.basename(input).replace(/(?:\.tar\.gz|\.tgz|\.[^.]+)$/i, '') + (metadataOnly ? ' - clean' : imageCopy ? ' - edited' : '');
  const suffix = ['PDF', 'Documents', 'Slides'].includes(info.category) && ['png', 'jpg'].includes(format) ? `${format}.zip` : format === 'gz' ? 'tar.gz' : format;
  const workDirectory = await allocateWorkspace(), temporary = path.join(workDirectory, 'result.tmp');
  let output;
  try {
    onProgress?.({ phase: 'Starting' });
    await runJob({ input: info.path, format, temporary, workDirectory, category: info.category, operation, imageOptions: metadataOnly ? {} : validatedOptions }, { signal, onProgress });
    if (signal?.aborted) throw new Error('Conversion cancelled.');
    for (let index = 1; index <= 10000; index++) {
      const candidate = path.join(directory, `${base}${index === 1 ? '' : ` (${index})`}.${suffix}`);
      try { await fs.copyFile(temporary, candidate, require('node:fs').constants.COPYFILE_EXCL); output = candidate; break; }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    if (!output) throw new Error('Too many outputs with this name.');
    return { input: info.path, output, bytes: (await fs.stat(output)).size };
  } finally { await releaseWorkspace(workDirectory); }
}
module.exports = { capabilities, inspect, convert };
