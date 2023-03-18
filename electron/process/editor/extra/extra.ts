import { app, ipcMain } from 'electron';
import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';

const root = app.getAppPath();

export async function getExtraFile(path: string, encoding?: BufferEncoding) {
    const client = import.meta.env.DEV ? 'public' : 'resources/assets';
    const p = resolve(root, client, path);
    return await readFile(p, encoding);
}

export function injectExtraInterface() {
    ipcMain.handle('extra.get', (e, path, encoding) =>
        getExtraFile(path, encoding)
    );

    ipcMain.handle('file.read', (e, path, options) => readFile(path, options));
    ipcMain.handle('file.readdir', (e, path) => readdir(path));
}
