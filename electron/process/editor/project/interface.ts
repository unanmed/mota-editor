import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { first } from '../../config/firstConfig';
import { controller } from '../../window/control';
import { EditorWindow } from '../../window/editor';
import { ProjectInfo } from './project';

export function getRecentFiles() {
    return first.data.recent ?? [];
}

export function setProjectInfo(e: IpcMainInvokeEvent, info: ProjectInfo) {
    const window = controller.find(e.sender);
    if (!(window instanceof EditorWindow)) return;
    window.project!.info = info;
    window.project!.save('project', info);
}

export function injectProjectInterface() {
    ipcMain.handle('project.recent', () => getRecentFiles());
    ipcMain.handle('project.setInfo', setProjectInfo);
}
