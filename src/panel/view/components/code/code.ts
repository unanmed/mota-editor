import { Ref, ref, shallowReactive } from 'vue';
import * as monaco from 'monaco-editor';
import { Panel } from '../../../../editor/view/panel';

type CodeFormat = 'javascript' | 'txt';

const fileMap = new Map<string, CodeFile>();

// 代码编辑器props，处理文件列表
export class CodeController {
    private static num = 0;

    fileList: CodeFile[] = shallowReactive([]);

    added: boolean = false;
    selected: Ref<number> = ref(-1);

    panel?: Panel;

    selectStack: string[] = [];

    readonly num = CodeController.num++;

    constructor() {
        codeList.push(this);
    }

    async add(content: CodeFile): Promise<void>;
    async add(path: string): Promise<void>;
    async add(path: string | CodeFile) {
        if (typeof path === 'string') {
            const content = await window.editor.file.read(path, 'utf-8');
            const type = path.split('.').at(-1) as CodeFormat;
            const uri = new monaco.Uri().with({ path });
            const index = this.indexOf(uri);

            if (index === -1) {
                const f = fileMap.get(uri.path);
                const file =
                    f ??
                    createCodeFile(
                        path.split(/(\/|\\)/).at(-1)!,
                        content,
                        type,
                        uri
                    );
                this.select(this.fileList.push(file) - 1);
            } else {
                this.select(index);
            }
        } else {
            const uri = path.uri;
            const index = this.indexOf(uri);
            if (index === -1) {
                const f = fileMap.get(uri.path);
                const file = f ?? path;
                this.select(this.fileList.push(file) - 1);
            } else {
                this.select(index);
            }
        }
    }

    remove(index: number) {
        const file = this.fileList[index];
        this.fileList.splice(index, 1);
        this.selectStack = this.selectStack.filter(v => v !== file.uri.path);
        if (this.selected.value === index) {
            const index = this.indexOf(this.selectStack.pop() ?? '');
            if (this.fileList[index]) this.select(index);
        }
    }

    close() {
        const index = codeList.indexOf(this);
        if (index === -1 || index === 0) return;
        codeList.splice(index, 1);
    }

    indexOf(path: string): number;
    indexOf(uri: monaco.Uri): number;
    indexOf(uri: monaco.Uri | string) {
        if (typeof uri === 'string') {
            return this.fileList.findIndex(v => v.uri.path === uri);
        } else return this.fileList.findIndex(v => v.uri.path === uri.path);
    }

    select(index: number, view?: monaco.editor.ICodeEditorViewState | null) {
        const file = this.fileList[index];
        if (view) file.view = view;
        this.selectStack.push(file.uri.path);
        if (this.selectStack.length > 50) this.selectStack.shift();
        this.selected.value = index;
        this.panel?.focus();
    }
}

type CodeListener = 'save';

// 文件类，处理文件
export class CodeFile {
    name: string;
    content: string;
    saved: Ref<boolean> = ref(true);
    format: CodeFormat;

    model: monaco.editor.IModel;
    uri: monaco.Uri;
    view?: monaco.editor.ICodeEditorViewState;

    listen: Record<string, ((p: any) => any)[]> = {};

    constructor(
        name: string,
        content: string,
        format: CodeFormat,
        uri: monaco.Uri
    ) {
        this.name = name;
        this.content = content;
        this.format = format;
        this.model = monaco.editor.createModel(this.content, format);
        this.model.setValue(content);
        this.uri = uri;
        const f = fileMap.get(uri.path);
        if (!f) fileMap.set(uri.path, this);
        else {
            this.content = f.content;
        }
    }

    save() {
        let success = true;
        this.listen.type?.forEach(v => {
            if (!v(this.content)) success = false;
        });
        if (success) this.saved.value = true;
    }

    on(type: CodeListener, fn: (p: any) => any) {
        this.listen[type] ??= [];
        this.listen[type]!.push(fn);
    }
}

export function createCodeFile(
    name: string,
    content: string,
    format: CodeFormat,
    uri: monaco.Uri
) {
    const f = fileMap.get(uri.path);
    if (f) return f;
    else return new CodeFile(name, content, format, uri);
}

export const codeList: CodeController[] = [];
