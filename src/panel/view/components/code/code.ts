import { shallowReactive } from 'vue';

type CodeFormat = 'js' | 'txt';

export class CodeProps {
    private static num = 0;

    fileList: CodeFile[] = shallowReactive([]);

    readonly num = CodeProps.num++;

    constructor() {
        codeList.push(this);
    }

    async add(content: CodeFile): Promise<void>;
    async add(path: string): Promise<void>;
    async add(path: string | CodeFile) {
        if (typeof path === 'string') {
            const content = await window.editor.file.read(path, 'utf-8');
            const type = path.split('.').at(-1) as CodeFormat;
            this.fileList.push(
                new CodeFile(path.split(/(\/|\\)/).at(-1)!, content, type)
            );
        } else {
            this.fileList.push(path);
        }
    }

    remove(content: CodeFile) {
        const index = this.fileList.indexOf(content);
        if (index === -1) return;
        this.fileList.splice(index, 1);
    }

    close() {
        const index = codeList.indexOf(this);
        if (index === -1) return;
        codeList.splice(index, 1);
    }
}

type CodeListener = 'save';

export class CodeFile {
    name: string;
    content: string;
    saved: boolean = true;
    format: CodeFormat;

    listen: Record<string, ((p: any) => any)[]> = {};

    constructor(name: string, content: string, format: CodeFormat) {
        this.name = name;
        this.content = content;
        this.format = format;
    }

    save() {
        let success = true;
        this.listen.type?.forEach(v => {
            if (!v(this.content)) success = false;
        });
        if (success) this.saved = true;
    }

    on(type: CodeListener, fn: (p: any) => any) {
        this.listen[type] ??= [];
        this.listen[type]!.push(fn);
    }
}

export const codeList: CodeProps[] = [];
