'use strict';
const path = require('node:path');
const crypto = require('node:crypto');
const { XMLParser, XMLValidator } = require('fast-xml-parser');
const { convert: htmlText } = require('html-to-text');
const { readZip } = require('./archives.cjs');
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', removeNSPrefix: true, processEntities: true, htmlEntities: true, trimValues: false });
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
function parseXML(text) { if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('Document entity declarations are not supported.'); if (XMLValidator.validate(text) !== true) throw new Error('Invalid document XML.'); return xml.parse(text); }
function escape(text) { return String(text).replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[value])); }
function toText(html) { return htmlText(html, { wordwrap: false, selectors: [{ selector: 'img', format: 'skip' }, { selector: 'a', options: { ignoreHref: true } }] }); }
async function packageEntries(input) { return readZip(await require('node:fs/promises').readFile(input)); }
async function readDocument(input, extension) {
  const fs = require('node:fs/promises');
  if (extension === 'rtf') {
    const data = await fs.readFile(input);
    if (!/^\{\\rtf\d/.test(data.toString('ascii', 0, 16))) throw new Error('Invalid RTF document.');
    if (/\\(?:object|objdata|field|filetbl|bin)\b/i.test(data.toString('latin1'))) throw new Error('RTF embedded objects, binary data, and fields are not supported.');
    // The parser consumes ASCII; represent literal code-page bytes as RTF hex escapes.
    const source = data.toString('latin1').replace(/[\x80-\xff]/g, char => `\\'${char.charCodeAt(0).toString(16)}`);
    const document = await new Promise((resolve, reject) => require('rtf-parser').string(source, (error, value) => error ? reject(error) : resolve(value)));
    const text = node => node.content ? node.content.map(text).join('') + (node.constructor.name === 'RTFParagraph' ? '\n\n' : '') : node.value || '';
    return document.content.map(text).join('').trim();
  }
  if (extension === 'docx') {
    await packageEntries(input); // Validate expansion bounds before the OOXML importer runs.
    return (await require('mammoth').extractRawText({ path: input })).value;
  }
  if (extension === 'md') return toText(await (await import('marked')).marked.parse(await fs.readFile(input, 'utf8')));
  if (extension === 'html') return toText(await fs.readFile(input, 'utf8'));
  if (extension === 'epub') {
    const entries = await packageEntries(input), files = new Map(entries.map(entry => [entry.name, entry.data]));
    if (files.has('META-INF/encryption.xml')) throw new Error('Encrypted or obfuscated EPUB content is not supported.');
    const container = files.get('META-INF/container.xml'); if (!container) throw new Error('EPUB container is missing.');
    const root = array(parseXML(container.toString()).container?.rootfiles?.rootfile)[0]?.['@full-path'];
    if (!root || !files.has(root)) throw new Error('EPUB package is missing.');
    const pkg = parseXML(files.get(root).toString()).package;
    const manifest = new Map(array(pkg.manifest?.item).map(item => [item['@id'], item['@href']]));
    const chapters = [];
    for (const item of array(pkg.spine?.itemref)) {
      const href = manifest.get(item['@idref']); if (!href) throw new Error('EPUB spine references a missing chapter.');
      const chapter = path.posix.normalize(path.posix.join(path.posix.dirname(root), decodeURIComponent(href.split('#')[0])));
      const body = files.get(chapter); if (!body) throw new Error('EPUB chapter is missing.');
      chapters.push(toText(body.toString()));
    }
    if (!chapters.length) throw new Error('EPUB has no readable chapters.');
    return chapters.join('\n\n');
  }
  return fs.readFile(input, 'utf8');
}
async function writeText(text, format, title = 'Document') {
  if (['txt', 'md'].includes(format)) return Buffer.from(text);
  if (format === 'html') return Buffer.from(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(title)}</title></head><body>${text.split(/\n{2,}/).map(paragraph => `<p>${escape(paragraph).replace(/\n/g, '<br>')}</p>`).join('\n')}</body></html>`);
  if (format === 'docx') {
    const { Document, Packer, Paragraph, TextRun } = require('docx');
    return Packer.toBuffer(new Document({ sections: [{ children: text.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] })) }] }));
  }
  if (format === 'epub') {
    const JSZip = require('jszip'), zip = new JSZip(), id = crypto.randomUUID();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
    const chapter = `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escape(title)}</title></head><body><h1>${escape(title)}</h1>${text.split(/\n{2,}/).map(p => `<p>${escape(p).replace(/\n/g, '<br/>')}</p>`).join('')}</body></html>`;
    zip.file('OEBPS/chapter.xhtml', chapter);
    zip.file('OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">Document</a></li></ol></nav></body></html>');
    zip.file('OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">urn:uuid:${id}</dc:identifier><dc:title>${escape(title)}</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="chapter"/></spine></package>`);
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
  throw new Error('Unsupported text output.');
}
async function readSlides(input) {
  const files = new Map((await packageEntries(input)).map(entry => [entry.name, entry.data]));
  const presentation = files.get('ppt/presentation.xml'), relationships = files.get('ppt/_rels/presentation.xml.rels');
  if (!presentation || !relationships) throw new Error('Invalid PPTX package.');
  const rels = new Map(array(parseXML(relationships.toString()).Relationships?.Relationship).map(rel => [rel['@Id'], rel['@Target']]));
  const ids = array(parseXML(presentation.toString()).presentation?.sldIdLst?.sldId);
  const extract = node => {
    if (!node || typeof node !== 'object') return '';
    const parts = [];
    for (const [key, value] of Object.entries(node)) {
      if (key === 't') parts.push(...array(value).map(v => typeof v === 'object' ? v['#text'] || '' : String(v)));
      else if (!key.startsWith('@')) { for (const child of array(value)) { const text = extract(child); if (text) parts.push(text + (key === 'p' ? '\n' : '')); } }
    }
    return parts.join(' ');
  };
  return ids.map(id => {
    const target = rels.get(id['@id']); if (!target) throw new Error('Missing slide relationship.');
    const file = files.get(path.posix.normalize(path.posix.join('ppt', target))); if (!file) throw new Error('Missing slide.');
    return extract(parseXML(file.toString())).trim();
  });
}
module.exports = { parseXML, array, escape, readDocument, writeText, readSlides, toText, packageEntries };
