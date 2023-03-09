import { app, ipcMain } from 'electron';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

const root = app.getAppPath();
console.log(root);

export async function getExtraFile(path: string, encoding?: BufferEncoding) {
    const client = import.meta.env.DEV ? 'src/extra' : 'resources';
    const p = resolve(process.cwd(), client, path);
    return await readFile(p, encoding);
}

export function injectExtraInterface() {
    ipcMain.handle('extra.get', (e, path, encoding) =>
        getExtraFile(path, encoding)
    );
}
