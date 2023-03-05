const { contextBridge, ipcRenderer } = require('electron');

// @ts-check
contextBridge.exposeInMainWorld('dev', {
    open: () => ipcRenderer.invoke('open-dev-tools')
});
