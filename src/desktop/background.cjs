'use strict';
const { BrowserWindow, Menu, Tray, nativeImage, nativeTheme, Notification, screen, ipcMain, systemPreferences } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { capabilities } = require('../core/converter.cjs');
const { createGesture } = require('./gesture.cjs');
const COMMON = ['png', 'jpg', 'webp', 'pdf', 'mp4', 'mp3', 'docx', 'zip', 'txt', 'epub', 'xlsx', 'vtt', 'flac', 'tar', 'gz', 'avif'];
function menuFor(paths, mode) {
  const infos = paths.map(capabilities);
  const values = infos.length ? (mode === 'tools' ? infos[0].tools : infos[0].targets).filter(value => infos.every(info => (mode === 'tools' ? info.tools : info.targets).includes(value))) : mode === 'tools' ? ['strip-metadata'] : COMMON;
  const note = mode === 'tools' && infos.length && !values.length ? 'No tools are available for these files yet. Choose Formats or cancel.' : infos.length ? [...new Set(infos.map(info => info.note))].join(' ') : 'Drop files onto the wheel, then release the mouse to choose.';
  return { mode, choices: values.map(value => ({ value, label: value === 'strip-metadata' ? 'Strip metadata' : value === 'optimize-image' ? 'Resize / quality' : value === 'gz' ? 'TAR.GZ' : value.toUpperCase() })), note };
}
async function createBackground({ showConverter, configure, submit, cancel, quit }) {
  let tray, overlay, ready = false, requested = false, menu, pending = [], timer, expiry, hook, paused = false, generation = 0;
  let status = 'Starting gesture listener';
  const wheelPath = path.join(__dirname, '../renderer/wheel.html');
  function trayImage() {
    const file = process.platform !== 'darwin' && nativeTheme.shouldUseDarkColors ? 'tray-light.png' : 'tray.png';
    const image = nativeImage.createFromPath(path.join(__dirname, file)).resize({ width: 20, height: 20 });
    if (process.platform === 'darwin') image.setTemplateImage(true);
    return image;
  }
  tray = new Tray(trayImage());
  const refreshIcon = () => tray.setImage(trayImage());
  nativeTheme.on('updated', refreshIcon);
  function updateTray() {
    tray.setToolTip(`Peeler — ${paused ? 'gestures paused' : status}`);
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Peeler — local file converter', enabled: false },
      { label: paused ? 'Gestures paused' : status, enabled: false },
      { type: 'separator' },
      { label: 'Choose files / conversion history', click: showConverter },
      { label: 'Pause drag gestures', type: 'checkbox', checked: paused, click: item => { paused = item.checked; hide(); updateTray(); } },
      { label: 'Cancel current batch', click: cancel },
      { type: 'separator' },
      { label: 'Quit Peeler', click: quit }
    ]));
  }
  function trusted(event) { return overlay && event.sender === overlay.webContents && event.senderFrame?.url === pathToFileURL(wheelPath).href; }
  function hide() { generation++; requested = false; clearTimeout(timer); clearTimeout(expiry); pending = []; overlay?.hide(); }
  function sendMenu() { if (ready && overlay && !overlay.isDestroyed()) overlay.webContents.send('wheel:menu', { ...menu, pending: pending.length > 0, fileCount: pending.length }); }
  function createOverlay() {
    overlay = new BrowserWindow({ width: 390, height: 480, show: false, frame: false, transparent: true, resizable: false, maximizable: false, minimizable: false, skipTaskbar: true, alwaysOnTop: true, focusable: false, hasShadow: false, title: 'Peeler conversion wheel', webPreferences: { preload: path.join(__dirname, 'overlay-preload.cjs'), sandbox: true, contextIsolation: true, nodeIntegration: false } });
    overlay.setAlwaysOnTop(true, 'pop-up-menu');
    overlay.webContents.setWindowOpenHandler(() => ({ action: 'deny' })); overlay.webContents.on('will-navigate', event => event.preventDefault());
    overlay.loadFile(wheelPath);
  }
  function peekSelection(token) {
    if (process.platform !== 'win32' || process.env.PEELER_DISABLE_HOOK === '1') return;
    const script = fs.readFileSync(path.join(__dirname, 'selection.ps1'), 'utf8');
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { timeout: 1800, windowsHide: true, maxBuffer: 128 * 1024 }, (error, stdout) => {
      if (error || token !== generation || pending.length || !overlay?.isVisible()) return;
      try { const paths = JSON.parse(stdout.replace(/^\uFEFF/, '').trim()); if (Array.isArray(paths) && paths.length > 0 && paths.length <= 500 && paths.every(value => typeof value === 'string' && path.isAbsolute(value))) { menu = menuFor(paths, menu.mode); sendMenu(); } } catch { /* Selection hints are optional; actual drop paths are always revalidated. */ }
    });
  }
  function open(mode = 'convert') {
    if (paused) return;
    clearTimeout(timer); clearTimeout(expiry); pending = []; requested = true; menu = menuFor([], mode); const token = ++generation;
    if (!overlay || overlay.isDestroyed()) { ready = false; createOverlay(); }
    const cursor = screen.getCursorScreenPoint(), area = screen.getDisplayNearestPoint(cursor).workArea;
    overlay.setBounds({ x: Math.round(Math.max(area.x, Math.min(cursor.x - 195, area.x + area.width - 390))), y: Math.round(Math.max(area.y, Math.min(cursor.y - 184, area.y + area.height - 480))), width: 390, height: 480 });
    if (ready) { overlay.setFocusable(false); sendMenu(); overlay.showInactive(); peekSelection(token); }
    expiry = setTimeout(hide, 30000);
  }
  async function apply(action) {
    if (!pending.length || typeof action?.value !== 'string' || !menu.choices.some(choice => choice.value === action.value) || action.mode !== menu.mode) throw new Error('Choose an available conversion.');
    const paths = pending; const mode = menu.mode; const value = action.value; hide();
    if (mode === 'tools' && value === 'optimize-image') { await configure(paths); return true; }
    await submit(paths, { mode, value });
    return true;
  }
  ipcMain.on('wheel:ready', event => { if (!trusted(event)) return; ready = true; if (requested) { sendMenu(); overlay.showInactive(); peekSelection(generation); } });
  ipcMain.on('wheel:close', event => { if (trusted(event)) hide(); });
  ipcMain.handle('wheel:drop', async (event, paths) => {
    if (!trusted(event)) throw new Error('Untrusted caller.');
    if (!Array.isArray(paths) || !paths.length || paths.length > 500 || paths.some(value => typeof value !== 'string' || !path.isAbsolute(value))) throw new Error('Drop up to 500 local files.');
    clearTimeout(timer); clearTimeout(expiry); pending = paths; menu = menuFor(paths, menu.mode); sendMenu();
    const bounds = overlay.getBounds(), area = screen.getDisplayMatching(bounds).workArea;
    overlay.setBounds({ ...bounds, y: Math.max(area.y, Math.min(bounds.y, area.y + area.height - 540)), height: 540 });
    overlay.setFocusable(true); overlay.show(); overlay.focus();
    return true;
  });
  ipcMain.handle('wheel:mode', (event, mode) => {
    if (!trusted(event)) throw new Error('Untrusted caller.');
    if (!pending.length || !['convert', 'tools'].includes(mode)) throw new Error('Drop files first, then choose Formats or Tools.');
    menu = menuFor(pending, mode); sendMenu();
  });
  ipcMain.handle('wheel:apply', (event, action) => { if (!trusted(event)) throw new Error('Untrusted caller.'); return apply(action); });
  ipcMain.handle('wheel:options', async event => {
    if (!trusted(event)) throw new Error('Untrusted caller.');
    if (!pending.length) throw new Error('Drop files first to choose more options.');
    const paths = pending; hide(); await configure(paths);
  });
  const gesture = createGesture({ open, close: hide, release: () => { timer = setTimeout(() => { if (!pending.length) hide(); }, 400); } });
  if (process.env.PEELER_DISABLE_HOOK === '1') status = 'Gesture listener disabled for tests';
  else if (process.platform === 'linux' && (process.env.XDG_SESSION_TYPE === 'wayland' || !process.env.DISPLAY)) status = 'Global drag keys need an X11 session; use the tray picker';
  else if (process.platform === 'darwin' && !systemPreferences.isTrustedAccessibilityClient(false)) status = 'Enable Accessibility access for Peeler, then restart';
  else {
    try {
      hook = require('uiohook-napi').uIOhook;
      hook.on('mousedown', gesture.down); hook.on('mousemove', gesture.move); hook.on('mouseup', gesture.up); hook.on('keydown', gesture.key); hook.start();
      status = process.platform === 'darwin' ? 'Drag + Left Shift / Command' : 'Drag + Left Shift / Left Alt';
    } catch (error) { status = `Gestures unavailable: ${error.message.slice(0, 90)}`; }
  }
  updateTray();
  tray.on('click', () => tray.popUpContextMenu());
  return { open, hide, status: () => status, stop() { clearTimeout(timer); clearTimeout(expiry); hook?.stop(); overlay?.destroy(); nativeTheme.removeListener('updated', refreshIcon); tray.destroy(); } };
}
function notify(title, body) { if (Notification.isSupported()) new Notification({ title, body }).show(); }
module.exports = { createBackground, menuFor, notify };
