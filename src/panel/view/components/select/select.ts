import { Uri } from 'monaco-editor';
import { reactive, ref, Ref, shallowReactive } from 'vue';
import { projectInfo } from '../../../../editor/project/project';
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

    close(): void {
        const index = selectionList.indexOf(this);
        if (index === -1 || index === 0) return;
        selectionList.splice(index, 1);
    }

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

    defaultAll: Ref<boolean> = ref(false);
    canDefaultAll?: boolean = true;

    name: string;
    suffix: Record<string, FiledSelectSuffix[]> = {};

    constructor(info: SelectInfo, selected: string[], base: string, uri: Uri) {
        super(uri);
        this.type = info.multi ? 'multi' : 'single';
        this.info = info;
        this.base = base;
        this.name = info.text;
        this.defaultAll.value =
            !!projectInfo.project!.info.defaultAll?.includes(uri.toString());
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
            if (!isValidName(file)) continue;
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

export function isValidName(name: string) {
    return /^[-\w_\.]+$/i.test(name);
}

export function changeDefaultAll(select: Selection) {
    const enabled = select.defaultAll;
    const info = projectInfo.project!.info;
    info.defaultAll ??= [];
    const uri = select.uri.toString();
    if (enabled) {
        if (!info.defaultAll.includes(uri)) info.defaultAll.push(uri);
    } else {
        const index = info.defaultAll.indexOf(uri);
        if (index !== -1) info.defaultAll.splice(index, 1);
    }
    window.editor.project.setInfo(info);
}
