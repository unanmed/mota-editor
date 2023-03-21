import { Uri } from 'monaco-editor';
import { reactive, shallowReactive } from 'vue';
import { MultiController, MultiItem } from '../multi/multi';

export interface SelectInfo {
    type: 'select';
    text: string;
    doc: string[];
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

    add(content: Selection | string | Uri) {
        if (typeof content === 'string') {
        } else if (content instanceof Selection) {
            const uri = content.uri;
            const index = this.indexOf(uri);
            if (index === -1) {
                this.select(this.list.push(content) - 1);
            } else {
                this.select(index);
            }
        } else {
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

    select(index: number) {
        this.selected.value = index;
    }
}

export interface Select {
    text: string;
    selected: boolean;
}

export interface FiledSelectSuffix {
    fn: string;
    params: any[];
}

export class Selection extends MultiItem<Select[]> {
    type: 'multi' | 'single' = 'single';
    choice: Select[] = reactive([]);
    info: SelectInfo;
    base: string;

    private _defaultAll: boolean = false;
    canDefaultAll?: boolean = true;

    get defaultAll(): boolean {
        return this._defaultAll;
    }
    set defaultAll(v: boolean) {
        if (!this.canDefaultAll) this._defaultAll = false;
        this._defaultAll = v;
    }

    name: string;
    suffix: Record<string, FiledSelectSuffix[]> = {};

    constructor(info: SelectInfo, selected: string[], base: string, uri: Uri) {
        super(uri);
        this.type = info.multi ? 'multi' : 'single';
        this.info = info;
        this.base = base;
        this.name = info.text;
        this.parseTarget(info.target).then(() => {
            selected.forEach(v => {
                const index = this.choice.findIndex(vv => vv.text === v);
                if (index !== -1) {
                    this.choice[index].selected = true;
                }
            });
        });
    }

    save(): void {}

    async parseTarget(target: string) {
        if (target === 'file') return this.parseFile();
    }

    async parseFile() {
        const path = this.info.path;
        const suffix = this.info.suffix;
        if (!path || !suffix) return;
        this.parseSuffix();
        const dir = await window.editor.file.readdir(this.base + '/' + path);
        const list: Select[] = [];
        for await (const file of dir) {
            const isFile = await window.editor.file.isFile(
                `${this.base}/${path}/${file}`
            );

            if (!isFile) continue;
            list.push(
                reactive({
                    text: file,
                    selected: false
                })
            );
        }

        this.choice.splice(0);
        this.choice.push(...list);
    }

    update(content: Select[]): void {}

    private parseSuffix() {
        if (!this.info.suffix) return;
        this.info.suffix.forEach(v => {
            const dot = v.indexOf('.');
            const func = v.slice(dot);
            const fns = func.split('.').slice(1);
            const list: FiledSelectSuffix[] = [];
            fns.forEach(v => {
                const match = v.match(/\(.*\)$/g);
                if (!match) {
                    list.push({
                        fn: v,
                        params: []
                    });
                } else {
                    const fn = v.replace(match[0], '');
                    if (fn === 'uncancelable') this.canDefaultAll = false;
                    list.push({
                        fn: fn,
                        params: match[0]
                            .slice(1, -1)
                            .split(',')
                            .map(v => v.trim())
                            .filter(v => !!v)
                    });
                }
            });
            const s = dot === -1 ? v : v.slice(0, dot);
            this.suffix[s] = list;
        });
    }
}

export const selectionList: SelectionController[] = [];
