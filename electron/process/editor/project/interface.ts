import { ipcMain } from 'electron';
import { first } from '../../config/firstConfig';

export function getRecentFiles() {
    return first.data.recent ?? [];
}

export function injectPrpjectInterface() {
    ipcMain.handle('project.recent', () => getRecentFiles());
}
