import { Button } from 'ant-design-vue';
import { Uri } from 'monaco-editor';
import { projectInfo, tables } from '../../../../editor/project/project';
import { view } from '../../../../editor/view/control';
import { addCode, addSelection, showCode, showSelection } from '../../control';
import {
    CodeController,
    CodeFile,
    codeList,
    createCodeFile
} from '../code/code';
import { MultiItem } from '../multi/multi';
import {
    Select,
    SelectInfo,
    Selection,
    SelectionController,
    selectionList
} from '../select/select';
import Table from './table.vue';

export interface TableElement {
    type: 'object' | 'code' | 'text' | 'json' | 'select';
    text: string;

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
            const uri = new Uri().with({
                path: `${props.path}${props.path ? '.' : ''}${props.keys}`,
                scheme: props.root
            });
            if (
                data.type === 'code' ||
                data.type === 'text' ||
                data.type === 'json'
            ) {
                const lang = data.type === 'code' ? 'javascript' : data.type;
                const editor = codeList[0] ?? addCode();
                if (!editor) return;

                const content = getTableValue(uri, data.type);
                const file = createCodeFile(data.text, content, lang, uri);
                editor.add(file);
                onTableSave(file, data.type);

                if (!editor.added) tryShowCode(editor);
            } else if (data.type === 'select') {
                const select = selectionList[0] ?? addSelection();
                if (!select) return;
                const content = getTableObject<string[]>(uri);
                const selection = new Selection(
                    content.info as SelectInfo,
                    content.content,
                    projectInfo.project!.data.path,
                    uri
                );
                select.add(selection);
                onTableSave(selection, 'select');

                if (!select.added) tryShowSelection(select);
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

export interface TableObject<T = any> {
    root: any;
    content: T;
    info: TableElement;
    lastKey: string;
}

export function getTableObject<T = any>(uri: Uri, data?: any): TableObject<T> {
    const stack = uri.path.split('.');
    const datas = data || {
        data: projectInfo.project!.mainData
    };
    let info = tables[stack[0]];
    let now: any = datas[stack[0] as keyof typeof datas];
    let root: any;
    let lastKey: string = '';
    for (let i = 1; i < stack.length; i++) {
        now = now[stack[i]];
        info = info.data[stack[i]];
        lastKey = stack[i];
        if (i === stack.length - 2) root = now;
    }
    return {
        root,
        content: now,
        info,
        lastKey
    };
}

function getTableValue(uri: Uri, type: TableElement['type'] = 'code') {
    const { content } = getTableObject(uri);
    if (type === 'json') return JSON.stringify(content, void 0, 4);
    else return content;
}

function onTableSave(file: MultiItem, type: TableElement['type'] = 'code') {
    const { root, lastKey: key } = getTableObject(file.uri);
    file.on('save', async (content: any) => {
        // 对表格数据赋值
        root[key] = getParsedData(content, type);

        const scheme = file.uri.scheme;
        // 保存至本地文件
        if (scheme === 'data') {
            const content = JSON.stringify(
                projectInfo.project!.mainData,
                void 0,
                4
            );

            await window.editor.file.write(
                `${projectInfo.project!.data.path}/project/data.js`,
                `var data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d = \r\n${content}`,
                'utf-8'
            );
        }
        return true;
    });
}

function getParsedData(data: any, type: TableElement['type']) {
    if (type === 'json') {
        return JSON.parse(data);
    } else if (type === 'select') {
        return (data as Select[]).filter(v => v.selected).map(v => v.text);
    } else {
        return data;
    }
}

function tryShowCode(editor: CodeController) {
    const panel = view.list.find(v => v.type === 'code');
    panel?.close();
    showCode(editor);
}

function tryShowSelection(selection: SelectionController) {
    const panel = view.list.find(v => v.type === 'select');
    panel?.close();
    showSelection(selection);
}
