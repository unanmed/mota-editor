import { Uri } from 'monaco-editor';
import { reactive, ref, Ref, shallowReactive } from 'vue';
import { projectInfo } from '../../../../editor/project/project';
import { MultiController, MultiItem } from '../multi/multi';
import { getTableObject } from '../table/table';

export interface SelectInfo {
    type: 'select';
    text: string;
    doc: string[];
    target: string;
    multi?: boolean;
    suffix?: string[];
    path?: string;
    value?: string[];
    show?: string[];
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

    close(): void {
        const index = selectionList.indexOf(this);
        if (index === -1 || index === 0) return;
        selectionList.splice(index, 1);
    }
}

export interface Select {
    text: string;
    selected: boolean;
    show?: string;
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

    constructor(
        info: SelectInfo,
        selected: string[] | string,
        base: string,
        uri: Uri
    ) {
        super(uri);
        this.type = info.multi ? 'multi' : 'single';
        this.info = info;
        this.base = base;
        this.name = info.text;
        this.defaultAll.value =
            !!projectInfo.project!.info.defaultAll?.includes(uri.toString());
        this.parseTarget(info.target).then(() => {
            this.updateSelected(selected, false);
        });
    }

    async save() {
        await this.doSave(this.choice);
        if (this.type === 'multi') {
            selectionList.forEach(v => {
                v.list.forEach(v => {
                    if (
                        v.info.target !== 'file' &&
                        v.info.target !== 'value' &&
                        v.type === 'single'
                    ) {
                        v.parseTarget(v.info.target);
                    }
                });
            });
        }
    }

    async parseTarget(target: string, data?: DataCore) {
        if (target === 'file') return this.parseFile();
        else if (target === 'value') {
            this.choice = this.info.value!.map((v, i) =>
                reactive({
                    text: v,
                    selected: false,
                    show: this.info.show?.[i]
                })
            );
            return;
        } else {
            // 一般值
            const scheme = this.uri.scheme;
            const t = target.replace(/^this/, scheme);
            const content = getTableObject<string[]>(
                new Uri().with({ scheme: this.uri.scheme, path: t }),
                data ? { data } : void 0
            );

            if (!(content.content instanceof Array)) return;
            this.choice.splice(0);
            this.choice.push(
                ...content.content.map(v =>
                    reactive({
                        text: v,
                        selected: false
                    })
                )
            );
        }
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
            const suffix = file.split('.').at(-1);
            let text = file;
            if (suffix) {
                if (this.suffix[suffix].some(v => v.fn === 'hide')) {
                    text = file.replace(`.${suffix}`, '');
                }
            }

            if (!isFile) continue;
            list.push(
                reactive({
                    text,
                    selected: false
                })
            );
        }

        this.choice.splice(0);
        this.choice.push(...list);
    }

    update(content: Select[]): void {}

    updateSelected(selected: string[] | string | number, save: boolean = true) {
        if (
            typeof selected === 'string' ||
            typeof selected === 'number' ||
            !selected
        ) {
            if (this.info.multi) {
                throw new TypeError(
                    `Expected for a string, but an array delivered in single selection.`
                );
            }

            this.choice.forEach(v => {
                v.selected = v.text.toString() === selected.toString();
            });
            return;
        } else {
            if (this.defaultAll.value) {
                this.choice.forEach(v => (v.selected = true));
            } else {
                selected.forEach(v => {
                    const index = this.choice.findIndex(vv => {
                        return vv.text === v;
                    });
                    if (index !== -1) {
                        this.choice[index].selected = true;
                    }
                });
            }
        }
        if (save) this.save();
    }

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
    const enabled = select.defaultAll.value;
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
