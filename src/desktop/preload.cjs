'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('peeler', {
  choose: () => ipcRenderer.invoke('files:choose'),
  list: () => ipcRenderer.invoke('files:list'),
  destination: (reset = false) => ipcRenderer.invoke('files:destination', reset),
  importFiles: files => ipcRenderer.invoke('files:import', Array.from(files, file => webUtils.getPathForFile(file))),
  convert: requests => ipcRenderer.invoke('files:convert', requests),
  cancel: () => ipcRenderer.invoke('files:cancel'),
  clear: () => ipcRenderer.invoke('files:clear'),
  quit: () => ipcRenderer.invoke('app:quit'),
  reveal: file => ipcRenderer.invoke('files:reveal', file),
  onResult: callback => ipcRenderer.on('conversion:result', (_event, result) => callback(result)),
  onProgress: callback => ipcRenderer.on('conversion:progress', (_event, progress) => callback(progress)),
  onImported: callback => ipcRenderer.on('files:added', (_event, result) => callback(result))
});
