'use strict';
const $ = selector => document.querySelector(selector);
const rows = [];
let busy = false;
let active;
let outputDirectory;
const bridge = window.peeler;
function message(text = '') { $('#message').textContent = text; }
function bytes(value) { return value < 1024 ? `${value} B` : value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }
function formatLabel(file, target) { return ['PDF', 'Documents', 'Slides'].includes(file.category) && ['png', 'jpg'].includes(target) ? `${target.toUpperCase()} pages (ZIP)` : file.category === 'Slides' && target === 'pdf' && file.note.startsWith('Text-only') ? 'PDF (text only)' : file.category === 'PDF' && target === 'pptx' ? 'PPTX (page images)' : target === 'gz' ? 'TAR.GZ' : target.toUpperCase(); }
function render() {
  const queue = $('#queue');
  const scroll = queue.scrollTop;
  $('.workspace').classList.toggle('has-files', rows.length > 0);
  queue.replaceChildren();
  for (const file of rows) {
    const row = document.createElement('div'); row.className = 'file-row';
    const identity = document.createElement('div'); identity.className = 'file-name'; identity.textContent = file.name; identity.title = file.name;
    const meta = document.createElement('span'); meta.className = 'file-meta'; meta.textContent = `${file.category} · ${bytes(file.bytes)}`; identity.append(meta);
    const format = document.createElement('button'); format.className = 'file-format'; format.textContent = file.operation === 'strip-metadata' ? 'Clean metadata' : file.target ? `→ ${formatLabel(file, file.target)}` : 'Unavailable'; format.setAttribute('aria-label', `Output format for ${file.name}`); format.disabled = busy || !!file.output || !file.targets.length;
    format.onclick = () => openFormats(file); format.onkeydown = event => { if (event.key === 'Shift') { event.preventDefault(); openFormats(file); } };
    const state = document.createElement('div'); state.className = `file-state${file.error ? ' error' : ''}`;
    if (file.output) { const reveal = document.createElement('button'); reveal.textContent = 'Show file'; reveal.onclick = () => bridge.reveal(file.output).catch(error => message(error.message)); state.append(reveal); }
    else state.textContent = file.error || (file.running ? file.progress || 'Queued' : file.target ? 'Ready' : 'Unsupported format');
    row.append(identity, format, state); queue.append(row);
    if (file.note) { const note = document.createElement('p'); note.className = 'file-note'; note.textContent = file.note; row.append(note); }
  }
  if (!rows.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Your files will appear here.'; queue.append(empty); }
  $('#destination-label').textContent = outputDirectory ? `Save to ${outputDirectory} · This session` : 'Save beside each original';
  $('#destination-label').title = outputDirectory || '';
  $('#destination').disabled = busy; $('#destination-reset').disabled = busy; $('#destination-reset').hidden = !outputDirectory;
  $('#count').textContent = `${rows.length} ${rows.length === 1 ? 'file' : 'files'}`;
  const ready = rows.filter(file => file.target && !file.output).length;
  $('#summary').textContent = busy ? 'Converting locally…' : rows.length ? `${rows.filter(file => file.output).length} converted · ${ready} ready` : 'No files selected';
  $('#convert').disabled = busy || !ready; $('#convert').textContent = busy ? 'Converting…' : 'Convert files';
  $('#clear').disabled = busy || !rows.length; $('#choose').disabled = busy;
  $('#cancel').hidden = !busy;
  queue.scrollTop = scroll;
}
function openFormats(file) {
  active = file;
  $('#format-file').textContent = file.name;
  $('#format-note').textContent = file.note || '';
  $('#image-options').hidden = file.category !== 'Images'; $('#image-options').disabled = file.category !== 'Images';
  $('#image-width').value = file.imageOptions?.width || ''; $('#image-height').value = file.imageOptions?.height || '';
  $('#image-quality').value = file.imageOptions?.quality || 85; $('#image-background').value = file.imageOptions?.background || '#ffffff';
  $('#format-wheel').replaceChildren();
  for (const target of file.targets) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = formatLabel(file, target);
    button.onclick = () => {
      if (!$('#format-dialog form').reportValidity()) return;
      active.target = target; active.operation = 'convert';
      if (active.category === 'Images') active.imageOptions = { width: $('#image-width').value ? Number($('#image-width').value) : undefined, height: $('#image-height').value ? Number($('#image-height').value) : undefined, quality: Number($('#image-quality').value), background: $('#image-background').value };
      $('#format-dialog').close(); render();
    };
    $('#format-wheel').append(button);
  }
  if (file.tools.includes('strip-metadata')) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Remove metadata';
    button.onclick = () => { active.operation = 'strip-metadata'; active.target = file.name.split('.').pop().toLowerCase(); $('#format-dialog').close(); render(); }; $('#format-wheel').append(button);
  }
  if (file.tools.includes('optimize-image')) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Save image copy';
    button.onclick = () => {
      if (!$('#format-dialog form').reportValidity()) return;
      active.imageOptions = { width: $('#image-width').value ? Number($('#image-width').value) : undefined, height: $('#image-height').value ? Number($('#image-height').value) : undefined, quality: Number($('#image-quality').value), background: $('#image-background').value };
      active.operation = 'optimize-image'; active.target = file.name.split('.').pop().toLowerCase(); $('#format-dialog').close(); render();
    }; $('#format-wheel').append(button);
  }
  $('#format-dialog').showModal();
}
function ingest(result) { if ('outputDirectory' in result) outputDirectory = result.outputDirectory; for (const file of result.files) if (!rows.some(row => row.id === file.id)) rows.push({ ...file, target: file.targets[0] }); message(result.errors.join('\n')); render(); if (result.configureId) { const file = rows.find(row => row.id === result.configureId); if (file?.targets.length && !$('#format-dialog').open) openFormats(file); } }
async function choose() { if (busy) return; if (!bridge) { message('Open Peeler with npm start to choose and convert local files.'); return; } try { ingest(await bridge.choose()); } catch (error) { message(error.message); } }
$('#choose').onclick = choose;
for (const [id, reset] of [['destination', false], ['destination-reset', true]]) $(`#${id}`).onclick = async () => { if (!bridge) return; try { outputDirectory = await bridge.destination(reset); render(); } catch (error) { message(error.message); } };
$('#quit').onclick = () => bridge?.quit().catch(error => message(error.message));
$('#dropzone').onclick = choose;
$('#dropzone').onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); choose(); } };
document.addEventListener('dragover', event => { event.preventDefault(); if (!busy) $('#dropzone').classList.add('dragging'); });
document.addEventListener('dragleave', event => { if (!event.relatedTarget) $('#dropzone').classList.remove('dragging'); });
document.addEventListener('drop', async event => { event.preventDefault(); $('#dropzone').classList.remove('dragging'); if (busy) return; if (!bridge) { message('Open Peeler with npm start to drop files.'); return; } try { ingest(await bridge.importFiles(Array.from(event.dataTransfer.files))); } catch (error) { message(error.message); } });
$('#clear').onclick = async () => { try { await bridge.clear(); rows.length = 0; message(); render(); } catch (error) { message(error.message); } };
function applyResult(result) { const file = rows.find(row => row.id === result.id); if (file) { file.running = false; file.output = result.output; file.error = result.error; render(); } }
bridge?.onResult(applyResult);
bridge?.onImported?.(ingest);
bridge?.onProgress?.(progress => { const file = rows.find(row => row.id === progress.id); if (file) { file.progress = progress.time ? `${progress.phase} ${progress.time}` : progress.total ? `${progress.phase} ${progress.current}/${progress.total}` : progress.phase; render(); } });
$('#cancel').onclick = async () => { try { await bridge.cancel(); message('Cancelling the current job and remaining batch…'); } catch (error) { message(error.message); } };
$('#convert').onclick = async () => {
  if (busy || !bridge) return;
  busy = true; message();
  const pending = rows.filter(file => file.target && !file.output); pending.forEach(file => { file.running = true; file.error = null; file.progress = null; }); render();
  try { (await bridge.convert(pending.map(file => ({ id: file.id, target: file.target, operation: file.operation || 'convert', imageOptions: file.imageOptions })))).forEach(applyResult); }
  catch (error) { message(error.message); }
  finally { busy = false; pending.forEach(file => file.running = false); render(); }
};
render();
bridge?.list?.().then(ingest).catch(error => message(error.message));
