import { app, ipcMain } from 'electron';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { EditorWindow } from '../../window/editor';
import { controller } from '../../window/control';

const root = app.getAppPath();

export async function getExtraFile(path: string, encoding?: BufferEncoding) {
    const client = import.meta.env.DEV ? 'public' : 'resources/assets';
    const p = resolve(root, client, path);
    return await readFile(p, encoding);
}

export async function readExtraDirOrDefualt(
    win: EditorWindow,
    dir: string,
    encoding?: BufferEncoding
) {
    try {
        const root = resolve(win.project!.dir, dir);
        const p = await readdir(root);
        return Promise.all(
            p.map(v => Promise.all([v, readFile(resolve(root, v), encoding)]))
        );
    } catch {
        const client = import.meta.env.DEV ? 'public' : 'resources/assets';
        const path = resolve(root, client, dir);
        const p = await readdir(path);
        return Promise.all(
            p.map(v => Promise.all([v, readFile(resolve(path, v), encoding)]))
        );
    }
}

export function injectExtraInterface() {
    ipcMain.handle('extra.get', (e, path, encoding) =>
        getExtraFile(path, encoding)
    );
    ipcMain.handle('extra.reado', (e, path, encoding) => {
        const editor = controller.find(e.sender);
        if (!editor || !(editor instanceof EditorWindow)) return [];
        return readExtraDirOrDefualt(editor, path, encoding);
    });

    ipcMain.handle('file.read', (e, path, options) => readFile(path, options));
    ipcMain.handle('file.readdir', (e, path) => readdir(path));
    ipcMain.handle('file.write', (e, path, content, options) =>
        writeFile(path, content, options)
    );
    ipcMain.handle('file.isFile', async (e, path) =>
        (await stat(path)).isFile()
    );
}
