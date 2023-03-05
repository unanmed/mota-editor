import { BrowserWindow, ipcMain } from 'electron';
import { openDevTools } from './dev/dev';
import { injectProjectSelector } from './editor/project/open';

export function injectWithWindow(win: BrowserWindow) {
    ipcMain.handle('open-dev-tools', () => openDevTools(win));
}

export function injectCommonModules() {
    injectProjectSelector();
}
