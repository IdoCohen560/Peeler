'use strict';
const fs = require('node:fs/promises');
const Excel = require('exceljs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const { parseXML, array, packageEntries } = require('./text-formats.cjs');
async function readWorkbook(input, extension) {
  if (extension === 'xlsx') {
    await packageEntries(input);
    const book = new Excel.Workbook(); await book.xlsx.readFile(input);
    return book.worksheets.map(sheet => {
      const rows = []; if (sheet.rowCount > 100000 || sheet.columnCount > 1000) throw new Error('Spreadsheet is too large.');
      sheet.eachRow({ includeEmpty: true }, row => rows.push(Array.from({ length: Math.max(sheet.columnCount, 1) }, (_, col) => {
        const cell = row.getCell(col + 1), value = cell.value;
        // Never evaluate formulas; use cached results if supplied by the producer.
        if (value && typeof value === 'object' && 'formula' in value) return value.result ?? '';
        if (value instanceof Date) return value.toISOString();
        return typeof value === 'object' && value !== null ? cell.text : value ?? '';
      })));
      return { name: sheet.name, rows };
    });
  }
  if (extension === 'ods') {
    const entries = await packageEntries(input), content = entries.find(entry => entry.name === 'content.xml');
    if (!content) throw new Error('ODS content is missing.');
    const doc = parseXML(content.data.toString()), tables = array(doc['document-content']?.body?.spreadsheet?.table);
    return tables.map(table => {
      const rows = [];
      for (const row of array(table['table-row'])) {
        const values = [];
        for (const cell of array(row['table-cell'])) {
          const repeat = Number(cell['@number-columns-repeated'] || 1);
          if (!Number.isInteger(repeat) || repeat < 1 || repeat > 1000) throw new Error('ODS repeated columns exceed the limit.');
          let value = cell['@value'] ?? cell['@boolean-value'] ?? cell['@date-value'] ?? cell['@string-value'] ?? array(cell.p).map(value => typeof value === 'object' ? value['#text'] || '' : value).join('\n');
          if (['float', 'percentage', 'currency'].includes(cell['@value-type'])) { const number = Number(value); if (!Number.isFinite(number)) throw new Error('Invalid ODS number.'); value = number; }
          if (cell['@value-type'] === 'boolean') value = value === 'true';
          for (let i = 0; i < repeat; i++) values.push(value);
        }
        const repeat = Number(row['@number-rows-repeated'] || 1);
        if (!Number.isInteger(repeat) || repeat < 1 || rows.length + repeat > 100000 || values.length > 1000) throw new Error('ODS size limit exceeded.');
        for (let i = 0; i < repeat; i++) rows.push([...values]);
      }
      return { name: table['@name'] || 'Sheet', rows };
    });
  }
  const rows = parse(await fs.readFile(input, 'utf8'), { delimiter: extension === 'tsv' ? '\t' : ',', bom: true, relax_column_count: true, skip_empty_lines: false, max_record_size: 1_000_000 });
  if (rows.length > 100000 || rows.some(row => row.length > 1000)) throw new Error('Spreadsheet size limit exceeded.');
  return [{ name: 'Sheet1', rows }];
}
async function writeWorkbook(sheets, format) {
  if (!sheets.length) throw new Error('No worksheets found.');
  if (format === 'ods') {
    const zip = new (require('jszip'))(), { escape } = require('./text-formats.cjs');
    zip.file('mimetype', 'application/vnd.oasis.opendocument.spreadsheet', { compression: 'STORE' });
    zip.file('META-INF/manifest.xml', '<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>');
    const content = value => escape(value ?? '').replace(/ +/g, spaces => `<text:s text:c="${spaces.length}"/>`).replace(/\r?\n/g, '<text:line-break/>').replace(/\t/g, '<text:tab/>');
    const cell = value => typeof value === 'number' && Number.isFinite(value) ? `<table:table-cell office:value-type="float" office:value="${value}"><text:p>${value}</text:p></table:table-cell>` : typeof value === 'boolean' ? `<table:table-cell office:value-type="boolean" office:boolean-value="${value}"><text:p>${value}</text:p></table:table-cell>` : `<table:table-cell office:value-type="string" office:string-value="${escape(value ?? '').replace(/\n/g, '&#10;').replace(/\r/g, '&#13;').replace(/\t/g, '&#9;')}"><text:p>${content(value)}</text:p></table:table-cell>`;
    zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.3"><office:body><office:spreadsheet>${sheets.map(sheet => `<table:table table:name="${escape(sheet.name)}">${sheet.rows.map(row => `<table:table-row>${row.map(cell).join('')}</table:table-row>`).join('')}</table:table>`).join('')}</office:spreadsheet></office:body></office:document-content>`);
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
  if (['csv', 'tsv'].includes(format)) {
    if (sheets.length > 1) throw new Error('This workbook has multiple sheets. Use XLSX or PDF; single-sheet CSV/TSV export would discard sheets.');
    return Buffer.from(stringify(sheets[0].rows, { delimiter: format === 'tsv' ? '\t' : ',' }));
  }
  if (format === 'pdf') {
    return require('./pdf.cjs').textPDF('', { pages: sheets.map(sheet => `${sheet.name}\n\n${sheet.rows.map(row => row.join('  |  ')).join('\n')}`), landscape: true });
  }
  const book = new Excel.Workbook();
  for (const sheet of sheets) { const worksheet = book.addWorksheet(sheet.name); worksheet.addRows(sheet.rows); }
  return Buffer.from(await book.xlsx.writeBuffer());
}
module.exports = { readWorkbook, writeWorkbook };
