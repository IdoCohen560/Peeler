'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const crypto = require('node:crypto');
const { inspect, convert } = require('../core/converter.cjs');
const { createBackground, notify } = require('./background.cjs');
const inputs = new Map(), outputs = new Set(), history = new Map();
let busy = false, batchController, window, background, quitting = false, outputDirectory;
const indexPath = path.join(__dirname, '../renderer/index.html');
if (process.env.PEELER_TEST_PROFILE) app.setPath('userData', path.resolve(process.env.PEELER_TEST_PROFILE));
if (!app.requestSingleInstanceLock()) app.quit();
else if (process.argv.includes('--quit')) app.quit();
else {
  app.on('second-instance', (_event, argv) => { if (argv.includes('--quit')) app.quit(); else if (argv.includes('--window')) showConverter(); });
  app.whenReady().then(start).catch(error => { console.error(error); app.quit(); });
}
function clientFile(id, info) { return { id, name: info.name, bytes: info.bytes, category: info.category, targets: info.targets, tools: info.tools, note: info.note, ...history.get(id) }; }
async function importFiles(paths) {
  if (!Array.isArray(paths) || paths.length + inputs.size > 500 || paths.some(p => typeof p !== 'string' || !path.isAbsolute(p))) throw new Error('The queue can hold up to 500 local files. Clear it from the tray converter to add more.');
  const files = [], errors = [];
  for (const file of paths) {
    try { const info = await inspect(file), id = crypto.randomUUID(); inputs.set(id, info); files.push(clientFile(id, info)); }
    catch (error) { errors.push(`${path.basename(file)}: ${error.message}`); }
  }
  return { files, errors };
}
function send(name, value) { if (window && !window.isDestroyed()) window.webContents.send(name, value); }
async function runBatch(requests) {
  if (busy) throw new Error('A batch is already running. Wait or cancel it from the tray menu.');
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 500) throw new Error('Choose between 1 and 500 files.');
  busy = true; batchController = new AbortController(); const results = [];
  try {
    for (const request of requests) {
      let result;
      try {
        const info = inputs.get(request.id); if (!info) throw new Error('Choose the file again.');
        result = { id: request.id, ...await convert({ input: info.path, target: request.target, operation: request.operation, imageOptions: request.imageOptions, outputDirectory, signal: batchController.signal, onProgress: progress => send('conversion:progress', { id: request.id, ...progress }) }) };
        outputs.add(result.output);
      } catch (error) { result = { id: request?.id, error: error.message }; }
      history.set(request?.id, result); results.push(result); send('conversion:result', result);
    }
    return results;
  } finally { busy = false; batchController = undefined; if (quitting) app.quit(); }
}
function handle(name, callback) {
  ipcMain.handle(name, async (event, ...args) => {
    if (!window || event.sender !== window.webContents || event.senderFrame?.url !== pathToFileURL(indexPath).href) throw new Error('Untrusted caller.');
    return callback(...args);
  });
}
function showConverter() {
  if (window && !window.isDestroyed()) { window.show(); window.focus(); return window; }
  window = new BrowserWindow({ width: 1080, height: 780, minWidth: 390, minHeight: 600, title: 'Peeler — optional converter', icon: path.join(__dirname, '../renderer/branding/peeler-512.png'), backgroundColor: '#f4f3f1', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' })); window.webContents.on('will-navigate', event => event.preventDefault());
  window.on('closed', () => { window = undefined; });
  window.loadFile(indexPath);
  return window;
}
async function start() {
  process.env.PEELER_WORK_ROOT ||= path.join(app.isPackaged ? app.getPath('temp') : app.getAppPath(), app.isPackaged ? 'peeler-jobs' : '.tmp/jobs');
  await require('../core/workspaces.cjs').recoverWorkspaces().catch(error => console.error(`Job cleanup: ${error.message}`));
  if (process.platform === 'win32') app.setAppUserModelId('org.peeler.converter');
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({ cancel: /^https?:|^wss?:/i.test(details.url) }));
  handle('files:choose', async () => { const result = await dialog.showOpenDialog(window, { properties: ['openFile', 'multiSelections'] }); return result.canceled ? { files: [], errors: [] } : importFiles(result.filePaths); });
  handle('files:import', importFiles);
  handle('files:list', () => ({ files: [...inputs].map(([id, info]) => clientFile(id, info)), errors: [], outputDirectory }));
  handle('files:destination', async reset => {
    if (busy) throw new Error('Wait for the batch to finish before changing its output folder.');
    if (typeof reset !== 'boolean') throw new Error('Invalid destination request.');
    if (reset) outputDirectory = undefined;
    else {
      const result = await dialog.showOpenDialog(window, { title: 'Save converted files to', properties: ['openDirectory'] });
      if (!result.canceled && result.filePaths.length === 1) outputDirectory = result.filePaths[0];
    }
    return outputDirectory || null;
  });
  handle('files:clear', () => { if (busy) throw new Error('Wait for the batch to finish.'); inputs.clear(); outputs.clear(); history.clear(); });
  handle('files:cancel', () => batchController?.abort());
  handle('files:convert', runBatch);
  handle('files:reveal', file => { if (!outputs.has(file)) throw new Error('Unknown output.'); shell.showItemInFolder(file); });
  handle('app:quit', () => { setImmediate(() => app.quit()); return true; });
  background = await createBackground({ showConverter, configure: async paths => {
    if (busy) throw new Error('Wait for the active batch to finish before adding options.');
    const imported = await importFiles(paths), targetWindow = showConverter();
    if (targetWindow.webContents.isLoadingMainFrame()) await new Promise(resolve => targetWindow.webContents.once('did-finish-load', resolve));
    send('files:added', { ...imported, configureId: imported.files.length === 1 ? imported.files[0].id : undefined });
  }, cancel: () => batchController?.abort(), quit: () => app.quit(), submit: async (paths, action) => {
    try {
      if (busy) throw new Error('A conversion batch is already running. Wait or cancel it from the tray menu.');
      const imported = await importFiles(paths); send('files:added', imported);
      if (imported.errors.length) throw new Error(imported.errors.join('\n'));
      const results = await runBatch(imported.files.map(file => ({ id: file.id, target: action.mode === 'tools' ? path.extname(file.name).slice(1).toLowerCase() : action.value, operation: action.mode === 'tools' ? action.value : 'convert' })));
      const failures = results.filter(result => result.error);
      if (!quitting) notify(failures.length ? 'Peeler — conversion needs attention' : 'Peeler — conversion complete', failures.length ? failures[0].error : `${results.length} ${results.length === 1 ? 'file saved' : 'files saved'} ${outputDirectory ? 'in the chosen output folder' : 'beside the originals'}.`);
    } catch (error) { if (!quitting) notify('Peeler — conversion needs attention', error.message); }
  } });
  if (process.platform === 'darwin') app.dock?.hide();
  if (process.argv.includes('--window') || process.env.PEELER_SHOW_WINDOW === '1') showConverter();
  app.on('activate', () => { /* The tray/menu bar owns normal activation. */ });
}
app.on('window-all-closed', () => { /* Keep the tray host running after windows close. */ });
app.on('before-quit', event => {
  quitting = true;
  if (busy) { event.preventDefault(); batchController?.abort(); return; }
  background?.stop();
});
