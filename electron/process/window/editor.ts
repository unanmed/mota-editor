import { BrowserWindow, ipcMain } from 'electron';
import { resolve } from 'path';
import { MotaProjectWatcher } from '../editor/project/watch';
import { injectWithWindow } from '../inject';
import { MotaWindow } from './control';

export class EditorWindow extends MotaWindow {
    win: BrowserWindow;
    closed: boolean = false;
    project?: string;
    watcher?: MotaProjectWatcher;

    constructor() {
        super();
        this.win = new BrowserWindow({
            webPreferences: {
                preload: resolve(__dirname, '../electron/preload/index.js')
            },
            width: 800,
            height: 600,
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                color: '#444',
                height: 40,
                symbolColor: '#ddd'
            },
            darkTheme: true
        });
        // 注入主进程与渲染进程通信函数
        injectWithWindow(this.win);
        this.win.setMenuBarVisibility(false);

        if (process.env.VITE_DEV_SERVER_URL) {
            this.win.loadURL(process.env.VITE_DEV_SERVER_URL);
        } else {
            this.win.loadFile('dist/index.html');
        }

        this.onSelectProject();
    }

    close(): void {
        this.watcher?.exit();
    }

    onSelectProject() {
        ipcMain.on('projectInfo', (e, path: string) => {
            if (e.sender === this.win.webContents) this.project = path;
            this.doWatch();
        });
    }

    doWatch() {
        if (!this.project) return;
        this.watcher = new MotaProjectWatcher(this.project);
        this.watcher.start();
    }
}
