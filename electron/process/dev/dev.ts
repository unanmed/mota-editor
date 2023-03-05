import { BrowserWindow } from 'electron';

export function openDevTools(win: BrowserWindow) {
    if (!win.webContents.isDevToolsOpened()) {
        win.webContents.openDevTools();
    } else {
        win.webContents.closeDevTools();
    }
}
