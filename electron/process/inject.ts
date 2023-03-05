import { BrowserWindow, ipcMain } from 'electron';
import { openDevTools } from './dev/dev';

export function injectWithWindow(win: BrowserWindow) {
    ipcMain.handle('open-dev-tools', () => openDevTools(win));
}
