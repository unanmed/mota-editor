import { BrowserWindow, WebContents } from 'electron';

export class WindowController {
    list: MotaWindow[] = [];

    constructor() {}

    add(window: MotaWindow) {
        if (!this.list.includes(window)) this.list.push(window);
    }

    remove(window: MotaWindow) {
        if (!window.closed) return;
        window.close();
        const index = this.list.indexOf(window);
        if (index === -1) return;
        this.list.splice(index, 1);
    }

    find(window: WebContents) {
        return this.list.find(v => v.win.webContents === window);
    }
}

export abstract class MotaWindow {
    closed: boolean = false;
    root?: string;
    abstract win: BrowserWindow;

    abstract close(): void;
}

export const controller = new WindowController();
