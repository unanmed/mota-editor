import { app, BrowserWindow, ipcMain, WebContents } from 'electron';
import { writeAllConfigFiles } from './process/config/control';
import { injectCommonModules, injectWithWindow } from './process/inject';
import { controller, WindowController } from './process/window/control';
import { EditorWindow } from './process/window/editor';

injectCommonModules();

app.whenReady().then(() => {
    const editor = new EditorWindow();
    controller.add(editor);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            const editor = new EditorWindow();
            controller.add(editor);
        }
    });
});

app.on('window-all-closed', async () => {
    await writeAllConfigFiles();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
