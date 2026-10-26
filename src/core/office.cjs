'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn, spawnSync } = require('node:child_process');
function officePath() {
  if (process.env.PEELER_OFFICE_PATH === 'disabled') return null;
  const executable = process.platform === 'win32' ? 'program/soffice.com' : process.platform === 'darwin' ? 'Contents/MacOS/soffice' : 'program/soffice';
  const candidates = [process.env.PEELER_OFFICE_PATH,
    path.join(process.resourcesPath || path.join(path.dirname(process.execPath), 'resources'), 'office', executable),
    path.join(__dirname, '../../tools/libreoffice', executable),
    ...(process.platform === 'win32' ? [path.join(process.env.ProgramFiles || 'C:/Program Files', 'LibreOffice', executable)] : process.platform === 'darwin' ? ['/Applications/LibreOffice.app/Contents/MacOS/soffice'] : ['/usr/bin/libreoffice', '/usr/bin/soffice'])];
  return candidates.find(file => file && path.isAbsolute(file) && fs.existsSync(file)) || null;
}
const available = () => !!officePath();
async function officeExport(input, format, work, { signal, onProgress } = {}) {
  const engine = officePath();
  if (!engine) throw new Error('The local Office engine is unavailable. See docs/OFFICE_ENGINE.md for setup.');
  if (signal?.aborted) throw new Error('Conversion cancelled.');
  const extension = path.extname(input).slice(1).toLowerCase();
  if (extension === 'rtf') await require('./text-formats.cjs').readDocument(input, 'rtf');
  if (['docx', 'pptx', 'xlsx', 'ods'].includes(extension)) {
    const entries = await require('./text-formats.cjs').packageEntries(input);
    for (const entry of entries) {
      if (/vbaProject\.bin$|externalLinks\//i.test(entry.name)) throw new Error('Macros and external workbook links are not supported.');
      if (/\.rels$/i.test(entry.name)) {
        const { parseXML, array } = require('./text-formats.cjs');
        for (const rel of array(parseXML(entry.data.toString()).Relationships?.Relationship)) {
          if (rel['@TargetMode'] === 'External' && !String(rel['@Type']).endsWith('/hyperlink')) throw new Error('Documents with linked external resources are not supported. Embed the resources first.');
        }
      }
    }
  }
  const profile = path.join(work, 'profile'), source = path.join(work, `source.${extension}`), out = path.join(work, 'out');
  await fsp.mkdir(path.join(profile, 'user'), { recursive: true }); await fsp.mkdir(out, { recursive: true });
  await fsp.writeFile(path.join(profile, 'user/registrymodifications.xcu'), '<?xml version="1.0"?><oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableMacrosExecution" oor:op="fuse"><value>true</value></prop><prop oor:name="DisableActiveContent" oor:op="fuse"><value>true</value></prop><prop oor:name="BlockUntrustedRefererLinks" oor:op="fuse"><value>true</value></prop><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item></oor:items>');
  await fsp.copyFile(input, source, fs.constants.COPYFILE_EXCL);
  const family = ['ppt', 'pptx'].includes(extension) ? 'impress' : ['xls', 'xlsx', 'ods'].includes(extension) ? 'calc' : 'writer';
  const filter = format === 'pdf' ? `pdf:${family}_pdf_Export` : ({ xlsx: 'xlsx:Calc MS Excel 2007 XML', xls: 'xls:MS Excel 97', ppt: 'ppt:MS PowerPoint 97' })[format] || format;
  onProgress?.({ phase: 'Rendering with Office engine' });
  await new Promise((resolve, reject) => {
    const child = spawn(engine, [`-env:UserInstallation=${pathToFileURL(profile).href}`, '--headless', '--nologo', '--nodefault', '--norestore', '--convert-to', filter, '--outdir', out, source], { windowsHide: true, shell: false, detached: process.platform !== 'win32' });
    const terminate = () => {
      if (!child.pid) return;
      if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore', timeout: 1000 });
      else { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
    };
    signal?.addEventListener('abort', terminate, { once: true }); process.once('exit', terminate);
    if (signal?.aborted) terminate();
    let diagnostic = '';
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { diagnostic = (diagnostic + chunk.toString()).slice(-4000); });
    child.on('error', reject);
    child.on('close', code => {
      signal?.removeEventListener('abort', terminate); process.removeListener('exit', terminate);
      if (signal?.aborted) reject(new Error('Conversion cancelled.'));
      else code === 0 ? resolve() : reject(new Error(`Office conversion failed: ${diagnostic.trim().slice(-1000) || code}`));
    });
  });
  const result = path.join(out, `source.${format}`);
  const stat = await fsp.stat(result).catch(() => null);
  if (!stat?.isFile() || !stat.size) throw new Error('Office could not convert this file. It may be damaged, protected, or unsupported.');
  if (stat.size > 200_000_000) throw new Error('Office output exceeds the 200 MB limit.');
  return result;
}
async function renderOffice(job, options) {
  const work = job.workDirectory;
  const pdf = await officeExport(job.input, 'pdf', work, options);
  if (job.format === 'pdf') await fsp.copyFile(pdf, job.temporary, fs.constants.COPYFILE_EXCL);
  else await require('./pdf.cjs').convertPDF({ input: pdf, format: job.format, temporary: job.temporary }, options);
}
module.exports = { officePath, available, officeExport, renderOffice };
