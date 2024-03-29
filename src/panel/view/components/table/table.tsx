import { Uri } from 'monaco-editor';
import { projectInfo, tables } from '../../../../editor/project/project';
import Table from './table.vue';
import { Edit } from './tableEdit';
import { Divider } from 'ant-design-vue';

export type TableType =
    | 'object'
    | 'code'
    | 'text'
    | 'json'
    | 'select'
    | 'checkbox'
    | 'event'
    | 'disabled'
    | 'number';

export interface TableElement {
    type: TableType;
    text: string;

    [key: string]: any;
}

export interface TableProps {
    root: string;
    keys: string;
    data: TableElement;
    n: number;
    path: string;
    memo?: boolean;
}

/**
 * 表格渲染器
 * @param props 数据
 */
export function TableRenderer(props: TableProps) {
    const data = props.data;

    if (data.hide) return <div></div>;

    if (data.type === 'object') {
        return (
            <Table
                root={props.root}
                keys={props.keys}
                data={data}
                n={props.n}
                path={`${props.path}${props.path ? '.' : ''}${props.keys}`}
                useSlot={false}
                memo={!!props.memo}
            ></Table>
        );
    } else {
        return (
            <div class={'table-one'}>
                <span class={'table-key'}>{props.keys}</span>
                <Divider class="table-divider" type="vertical"></Divider>
                <span class={'table-text'}>{data.text ?? ''}</span>
                <Divider class="table-divider" type="vertical"></Divider>
                <span class={'table-edit'}>
                    <Edit
                        root={props.root}
                        keys={props.keys}
                        data={data}
                        n={props.n}
                        path={props.path}
                    ></Edit>
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
        // 避免出现读取undefined的情况
        if (i < stack.length - 2) now[stack[i]] ??= {};
        else now[stack[i]] ??= null;
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
