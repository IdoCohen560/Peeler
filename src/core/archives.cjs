'use strict';
const path = require('node:path');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const JSZip = require('jszip');
const yauzl = require('yauzl');
const tar = require('tar-stream');
const MAX_BYTES = 200 * 1024 * 1024, MAX_ENTRIES = 10000;
function safeName(name) {
  if (!name || name.includes('\\') || name.includes('\0') || name.startsWith('/') || /^[a-z]:/i.test(name) || name.split('/').some(part => part === '..' || part.includes(':'))) throw new Error('Archive contains an unsafe path.');
  const normalized = path.posix.normalize(name);
  if (normalized === '.' || normalized.startsWith('../')) throw new Error('Archive contains an unsafe path.');
  return normalized;
}
function readZip(buffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true, strictFileNames: true }, (error, zip) => {
      if (error) return reject(error);
      const entries = [], names = new Set(); let total = 0, count = 0, failed = false;
      const fail = error => { if (!failed) { failed = true; zip.close(); reject(error); } };
      zip.on('error', fail);
      zip.on('end', () => { if (!failed) resolve(entries); });
      zip.on('entry', entry => {
        try {
          const name = safeName(entry.fileName);
          if (++count > MAX_ENTRIES || (total += entry.uncompressedSize) > MAX_BYTES) throw new Error('Archive exceeds the 200 MB / 10,000 entry limit.');
          const mode = (entry.externalFileAttributes >>> 16) & 0xf000;
          if (mode === 0xa000) throw new Error('Archive symbolic links are not supported.');
          if (entry.isEncrypted()) throw new Error('Encrypted archives are not supported.');
          if (names.has(name)) throw new Error('Archive has duplicate entry names.'); names.add(name);
          if (name.endsWith('/')) { entries.push({ name, directory: true, data: Buffer.alloc(0) }); return zip.readEntry(); }
          zip.openReadStream(entry, (error, stream) => {
            if (error) return fail(error);
            const chunks = []; let bytes = 0;
            stream.on('data', chunk => { bytes += chunk.length; if (bytes > entry.uncompressedSize || bytes > MAX_BYTES) { stream.destroy(new Error('Archive expansion limit exceeded.')); } else chunks.push(chunk); });
            stream.on('error', fail);
            stream.on('end', () => { if (!failed) { entries.push({ name, data: Buffer.concat(chunks) }); zip.readEntry(); } });
          });
        } catch (error) { fail(error); }
      });
      zip.readEntry();
    });
  });
}
function readTar(buffer) {
  return new Promise((resolve, reject) => {
    const extract = tar.extract(); const entries = [], names = new Set(); let total = 0, count = 0;
    extract.on('error', reject);
    extract.on('entry', (header, stream, next) => {
      try {
        const name = safeName(header.name);
        if (++count > MAX_ENTRIES || (total += header.size) > MAX_BYTES) throw new Error('Archive expansion limit exceeded.');
        if (!['file', 'directory'].includes(header.type)) throw new Error('Archive links and special entries are not supported.');
        if (names.has(name)) throw new Error('Archive has duplicate entry names.'); names.add(name);
        const chunks = []; let bytes = 0;
        stream.on('data', chunk => { bytes += chunk.length; if (bytes > header.size) extract.destroy(new Error('Archive size mismatch.')); else chunks.push(chunk); });
        stream.on('error', error => extract.destroy(error));
        stream.on('end', () => { entries.push({ name, data: Buffer.concat(chunks), directory: header.type === 'directory' }); next(); });
        stream.resume();
      } catch (error) { extract.destroy(error); }
    });
    extract.on('finish', () => resolve(entries)); extract.end(buffer);
  });
}
async function readArchive(buffer, extension, basename = 'file') {
  if (extension === 'rar') return readRar(buffer);
  if (extension === 'zip') return readZip(buffer);
  if (extension === 'tar') return readTar(buffer);
  const unpacked = await promisify(zlib.gunzip)(buffer, { maxOutputLength: MAX_BYTES });
  const isTar = /\.(tar\.gz|tgz)$/i.test(basename) || unpacked.subarray(257, 262).toString() === 'ustar';
  return isTar ? readTar(unpacked) : [{ name: safeName(basename.replace(/\.gz$/i, '') || 'file'), data: unpacked }];
}
async function readRar(buffer) {
  if (buffer.subarray(0, 6).toString('hex') !== '526172211a07') throw new Error('Invalid RAR archive.');
  const { ArchiveReader, libarchiveWasm } = require('libarchive-wasm');
  const engine = await libarchiveWasm({ wasmBinary: await require('node:fs/promises').readFile(require.resolve('libarchive-wasm/dist/libarchive.wasm')) });
  const reader = new ArchiveReader(engine, new Int8Array(buffer)), entries = [], names = new Set();
  let total = 0;
  try {
    for (const entry of reader.entries()) {
      const name = safeName(entry.getPathname()), size = entry.getSize(), type = entry.getFiletype();
      if (entry.isEncrypted()) throw new Error('Encrypted RAR archives are not supported.');
      if (!['File', 'Directory'].includes(type) || entry.getSymlinkTarget() || entry.getHardlinkTarget()) throw new Error('RAR links and special entries are not supported.');
      if (!Number.isSafeInteger(size) || size < 0 || (total += size) > MAX_BYTES || entries.length >= MAX_ENTRIES) throw new Error('RAR exceeds the 200 MB / 10,000 entry limit.');
      if (names.has(name)) throw new Error('Archive has duplicate entry names.'); names.add(name);
      if (type === 'Directory') { entries.push({ name: name.endsWith('/') ? name : `${name}/`, directory: true, data: Buffer.alloc(0) }); continue; }
      const chunks = []; let bytes = 0;
      const pointer = engine.module._malloc(65536);
      try {
        for (;;) {
          const count = engine.read_data(reader.archive, pointer, 65536);
          if (!count) break;
          bytes += count; if (bytes > size) throw new Error('RAR entry size exceeds its declared limit.');
          chunks.push(Buffer.from(engine.module.HEAPU8.subarray(pointer, pointer + count)));
        }
      } finally { engine.module._free(pointer); }
      if (bytes !== size) throw new Error('RAR entry is truncated.');
      entry.readCalled = true;
      entries.push({ name, data: Buffer.concat(chunks) });
    }
    const diagnostic = engine.error_string(reader.archive);
    if (diagnostic) throw new Error(`RAR decoding failed: ${diagnostic}`);
    if (reader.hasEncryptedData()) throw new Error('Encrypted RAR archives are not supported.');
    return entries;
  } finally { reader.free(); }
}
async function writeArchive(entries, format) {
  if (format === 'zip') {
    const zip = new JSZip(); for (const entry of entries) zip.file(entry.name, entry.data, { dir: !!entry.directory });
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
  const buffer = await new Promise((resolve, reject) => {
    const pack = tar.pack(), chunks = []; pack.on('data', chunk => chunks.push(chunk)); pack.on('error', reject); pack.on('end', () => resolve(Buffer.concat(chunks)));
    for (const entry of entries) pack.entry({ name: entry.name, type: entry.directory ? 'directory' : 'file', size: entry.data.length, mode: entry.directory ? 0o755 : 0o644 }, entry.data);
    pack.finalize();
  });
  return format === 'gz' ? promisify(zlib.gzip)(buffer) : buffer;
}
module.exports = { safeName, readZip, readTar, readArchive, writeArchive, MAX_BYTES };
