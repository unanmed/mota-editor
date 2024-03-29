import { Ref, ref, shallowReactive } from 'vue';
import * as monaco from 'monaco-editor';
import { Panel } from '../../../../editor/view/panel';
import { MultiController, MultiItem } from '../multi/multi';
import { spliceElement } from '../../../../editor/utils/utils';
import { addCode } from '../../control';
import { tryShowCode } from '../table/tableEdit';
import { isNil } from 'lodash';

export type CodeFormat = 'javascript' | 'text' | 'json';

const fileMap = new Map<string, CodeFile>();

// 代码编辑器，处理文件列表
export class CodeController extends MultiController<CodeFile> {
    constructor() {
        super();
        codeList.push(this);
        this.on(
            'select',
            (index, view: monaco.editor.ICodeEditorViewState | null) => {
                if (view) this.list[this.selected.value].view = view;
                const file = this.list[index];
                const lib = file.extraLib;
                this.list.forEach(v => (v.selected = false));
                file.selected = true;
                monaco.languages.typescript.javascriptDefaults.setExtraLibs(
                    lib.map(v => ({ content: v }))
                );
            }
        );
        this.on(
            'remove',
            (index, view: monaco.editor.ICodeEditorViewState | null) => {
                const file = this.list[index];
                if (view) file.view = view;
            }
        );
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

    close() {
        const index = codeList.indexOf(this);
        if (index === -1 || index === 0) return;
        codeList.splice(index, 1);
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

    extraLib: string[] = [];

    selected: boolean = false;

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
        this.model = monaco.editor.createModel(this.content, format, uri);
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

    addExtraLib(...content: string[]) {
        this.extraLib.push(...content);
        if (this.selected) {
            this.setLib();
        }
    }

    removeExtraLib(content: string) {
        spliceElement(this.extraLib, content);
        if (this.selected) {
            this.setLib();
        }
    }

    setExtraLib(content: string[]) {
        this.extraLib = content;
        if (this.selected) {
            this.setLib();
        }
    }

    setLib() {
        monaco.languages.typescript.javascriptDefaults.setExtraLibs(
            this.extraLib.map(v => ({ content: v }))
        );
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

export function addCodeFile(
    name: string,
    content: string,
    type: CodeFormat,
    uri: monaco.Uri,
    defaults?: string
) {
    const editor = codeList[0] ?? addCode();
    if (!editor) return;
    if (!isNil(defaults)) content ??= defaults;

    const file = createCodeFile(name, content, type, uri);
    editor.add(file);

    if (!editor.added) tryShowCode(editor);
    return file;
}
