import { Uri } from 'monaco-editor';
import { reactive, shallowReactive } from 'vue';
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
    selectStack: string[] = [];

    constructor() {
        super();
        selectionList.push(this);
    }

    add(content: Selection | string) {
        if (typeof content === 'string') {
        } else {
            const uri = content.uri;
            const index = this.indexOf(uri);
            if (index === -1) {
                this.select(this.list.push(content) - 1);
            } else {
                this.select(index);
            }
        }
    }

    remove(index: number) {
        const select = this.list[index];
        this.list.splice(index, 1);

        this.selectStack = this.selectStack.filter(v => v !== select.uri.path);
        if (this.selected.value === index) {
            const index = this.indexOf(this.selectStack.pop() ?? '');
            if (this.list[index]) this.select(index);
        }
    }

    close(): void {}

    select(index: number) {}
}

interface Select {
    text: string;
    selected: boolean;
}

export class Selection extends MultiItem<Select[]> {
    type: 'multi' | 'single' = 'single';
    choice: Select[] = reactive([]);
    info: SelectInfo;
    base: string;

    constructor(info: SelectInfo, base: string, uri: Uri) {
        super(uri);
        this.type = info.multi ? 'multi' : 'single';
        this.info = info;
        this.base = base;
    }

    save(): void {}

    async parseTarget(target: string) {
        if (target === 'file') return this.parseFile();
    }

    async parseFile() {
        const path = this.info.path;
        const suffix = this.info.suffix;
        if (!path || !suffix) return;
        const dir = window.editor.file.readdir(this.base + '/' + path);
    }

    update(content: Select[]): void {}
}

export const selectionList: SelectionController[] = [];
