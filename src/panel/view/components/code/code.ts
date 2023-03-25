import { Ref, ref, shallowReactive } from 'vue';
import * as monaco from 'monaco-editor';
import { Panel } from '../../../../editor/view/panel';
import { MultiController, MultiItem } from '../multi/multi';

type CodeFormat = 'javascript' | 'text' | 'json';

const fileMap = new Map<string, CodeFile>();

// 代码编辑器，处理文件列表
export class CodeController extends MultiController<CodeFile> {
    selectStack: string[] = [];

    constructor() {
        super();
        codeList.push(this);
    }

    async add(path: string | CodeFile) {
        if (typeof path === 'string') {
            const content = await window.editor.file.read(path, 'utf-8');
            const type = path.split('.').at(-1) as CodeFormat;
            const uri = new monaco.Uri().with({ path });
            const index = this.indexOf(uri);

            if (index === -1) {
                const f = fileMap.get(uri.toString());
                const name = path.split(/(\/|\\)/).at(-1)!;
                const file = f ?? createCodeFile(name, content, type, uri);
                this.select(this.list.push(file) - 1);
            } else {
                this.select(index);
            }
        } else {
            const uri = path.uri;
            const index = this.indexOf(uri);
            if (index === -1) {
                const f = fileMap.get(uri.toString());
                const file = f ?? path;
                this.select(this.list.push(file) - 1);
            } else {
                this.select(index);
            }
        }
    }

    remove(index: number, view?: monaco.editor.ICodeEditorViewState | null) {
        const file = this.list[index];
        if (view) file.view = view;
        this.list.splice(index, 1);
        this.selectStack = this.selectStack.filter(v => v !== file.uri.path);
        if (this.selected.value === index) {
            const index = this.indexOf(this.selectStack.pop() ?? '');
            if (this.list[index]) this.select(index);
        }
    }

    close() {
        const index = codeList.indexOf(this);
        if (index === -1 || index === 0) return;
        codeList.splice(index, 1);
    }

    select(index: number, view?: monaco.editor.ICodeEditorViewState | null) {
        const file = this.list[index];
        if (view) this.list[this.selected.value].view = view;
        this.selectStack.push(file.uri.path);
        if (this.selectStack.length > 50) this.selectStack.shift();
        this.selected.value = index;
        this.panel?.focus();
    }
}

// 文件类，处理文件
export class CodeFile extends MultiItem<string> {
    name: string;
    content: string;
    saved: Ref<boolean> = ref(true);
    format: CodeFormat;

    model: monaco.editor.IModel;
    view?: monaco.editor.ICodeEditorViewState;

    canWatch: boolean = true;

    constructor(
        name: string,
        content: string,
        format: CodeFormat,
        uri: monaco.Uri
    ) {
        super(uri);
        this.name = name;
        this.content = content;
        this.format = format;
        this.model = monaco.editor.createModel(this.content, format);
        this.model.setValue(content);
        const f = fileMap.get(uri.toString());
        if (!f) fileMap.set(uri.toString(), this);
        else {
            this.content = f.content;
        }
    }

    async save() {
        const success = await this.doSave(this.model.getValue());
        if (success) this.saved.value = true;
    }

    update(content: string): void {
        this.model.setValue(content);
        this.saved.value = true;
    }
}

export function createCodeFile(
    name: string,
    content: string,
    format: CodeFormat,
    uri: monaco.Uri
) {
    const f = fileMap.get(uri.toString());
    if (f && f.content === content) return f;
    else return new CodeFile(name, content, format, uri);
}

export const codeList: CodeController[] = [];

export function getFormatedString(
    data: any,
    type: 'code' | 'json' | 'text' | 'number'
) {
    if (type === 'json' || type === 'number')
        return JSON.stringify(data, void 0, 4);
    else return data as string;
}
