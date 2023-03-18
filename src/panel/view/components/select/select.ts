import { Uri } from 'monaco-editor';
import { MultiController, MultiItem } from '../multi/multi';

interface SelectInfo {
    type: 'select';
    text: string;
    target: string;
    multi?: boolean;
    suffix?: string[];
    path?: string;
}

export class SelectionController extends MultiController<Selection> {
    add(content: any) {}

    remove(content: any) {}

    close(): void {}
}

export class Selection extends MultiItem {
    type: 'multi' | 'single' = 'single';
    choice: any[] = [];
    info: SelectInfo;
    base: string;

    constructor(info: SelectInfo, base: string, uri: Uri) {
        super(uri);
        this.type = info.multi ? 'multi' : 'single';
        this.info = info;
        this.base = base;
    }

    save(content: any): void {}

    async parseTarget(target: string) {
        if (target === 'file') return this.parseFile();
    }

    async parseFile() {
        const path = this.info.path;
        const suffix = this.info.suffix;
        if (!path || !suffix) return;
        const dir = window.editor.file.readdir(this.base + '/' + path);
    }
}
