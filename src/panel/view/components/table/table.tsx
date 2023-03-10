import { Button } from 'ant-design-vue';
import { Uri } from 'monaco-editor';
import { projectInfo } from '../../../../editor/project/project';
import { addCode, showCode } from '../../control';
import { CodeFile, codeList, createCodeFile } from '../code/code';
import Table from './table.vue';

export interface TableElement {
    type: 'object' | 'code' | 'text';

    [key: string]: any;
}

export interface TableProps {
    root: string;
    keys: string;
    data: TableElement;
    n: number;
    path: string;
}

/**
 * 表格渲染器
 * @param props 数据
 */
export function TableRenderer(props: TableProps) {
    const data = props.data;

    if (data.type === 'object') {
        return (
            <Table
                root={props.root}
                keys={props.keys}
                data={data}
                n={props.n}
                path={`${props.path}${props.path ? '.' : ''}${props.keys}`}
            ></Table>
        );
    } else {
        const edit = () => {
            if (data.type === 'code' || data.type === 'text') {
                const lang = data.type === 'code' ? 'javascript' : 'text';
                const editor = codeList[0] ?? addCode();
                if (!editor) return;
                const uri = new Uri().with({
                    path: `table://${props.path}${props.path ? '.' : ''}${
                        props.keys
                    }`
                });
                const content = getTableValue(uri, data.type);
                const file = createCodeFile(data.text, content, lang, uri);
                editor.add(file);
                onTableSave(file, data.type);

                if (!editor.added) showCode(editor);
            }
        };
        return (
            <div class={'table-one'}>
                <span class={'table-key'}>{props.keys}</span>
                <span class={'table-text'}>{data.text ?? ''}</span>
                <span class={'table-edit'}>
                    <Button onClick={edit} style="font-size: 16px">
                        编辑
                    </Button>
                </span>
            </div>
        );
    }
}

export function getTableObject(uri: Uri) {
    const key = uri.path.split('/')[3];
    const stack = key.split('.');
    const datas = {
        data: projectInfo.project!.mainData
    };
    let now: any = datas[stack[0] as keyof typeof datas];
    let root: any;
    for (let i = 1; i < stack.length; i++) {
        now = now[stack[i]];
        if (i === stack.length - 2) root = now;
    }
    return {
        root,
        content: now
    };
}

function getTableValue(uri: Uri, type: 'code' | 'text' = 'code') {
    const { content } = getTableObject(uri);
    if (type === 'code') return JSON.stringify(content, void 0, 4);
    else return content;
}

function onTableSave(file: CodeFile, type: 'code' | 'text' = 'code') {
    const { root } = getTableObject(file.uri);
    const key = file.uri.path.split('.').at(-1)!;
    file.on('save', (content: string) => {
        if (type === 'code') root[key] = JSON.parse(content);
        else root[key] = content;
        return true;
    });
}
