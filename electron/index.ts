import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: resolve(__dirname, './preload/index.js')
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile('dist/index.html');
    }
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
