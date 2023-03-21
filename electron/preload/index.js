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
        getRecent: () => ipcRenderer.invoke('project.recent'),
        sendProjectInfo: path => ipcRenderer.send('projectInfo', path)
    },
    extra: {
        get: (path, encoding) => ipcRenderer.invoke('extra.get', path, encoding)
    },
    file: {
        read: (path, options) => ipcRenderer.invoke('file.read', path, options),
        readdir: path => ipcRenderer.invoke('file.readdir', path),
        write: (path, content, options) =>
            ipcRenderer.invoke('file.write', path, content, options),
        isFile: path => ipcRenderer.invoke('file.isFile', path)
    },
    socket: {
        getPort: path => ipcRenderer.invoke('socket.getPort', path)
    }
});
