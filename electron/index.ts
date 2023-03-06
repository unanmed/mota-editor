import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';
import { injectCommonModules, injectWithWindow } from './process/inject';

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: resolve(__dirname, '../electron/preload/index.js')
        },
        width: 800,
        height: 600,
        titleBarStyle: 'hidden'
    });

    // 注入主进程与渲染进程通信函数
    injectWithWindow(win);
    injectCommonModules();
    win.setMenuBarVisibility(false);

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
