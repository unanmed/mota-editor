import { ipcMain } from 'electron';
import { first } from '../../config/firstConfig';

export function getRecentFiles() {
    return first.data.recent ?? [];
}

export function injectProjectInterface() {
    ipcMain.handle('project.recent', () => getRecentFiles());
}
