const { contextBridge, ipcRenderer } = require('electron');

// @ts-check
contextBridge.exposeInMainWorld('dev', {
    open: () => ipcRenderer.invoke('open-dev-tools')
});

contextBridge.exposeInMainWorld('editor', {
    project: {
        select: () => ipcRenderer.invoke('project.select'),
        open: path => ipcRenderer.invoke('project.open', path),
        selectFolder: path => ipcRenderer.invoke('project.selectFolder', path),
        close: path => ipcRenderer.invoke('project.close', path),
        getRecent: () => ipcRenderer.invoke('project.recent')
    },
    extra: {
        get: (path, encoding) => ipcRenderer.invoke('extra.get', path, encoding)
    }
});
