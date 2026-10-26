'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('wheel', {
  onMenu: callback => ipcRenderer.on('wheel:menu', (_event, menu) => callback(menu)),
  ready: () => ipcRenderer.send('wheel:ready'),
  drop: files => ipcRenderer.invoke('wheel:drop', Array.from(files, file => webUtils.getPathForFile(file))),
  setMode: mode => ipcRenderer.invoke('wheel:mode', mode),
  apply: action => ipcRenderer.invoke('wheel:apply', action),
  options: () => ipcRenderer.invoke('wheel:options'),
  close: () => ipcRenderer.send('wheel:close')
});
