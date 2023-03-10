import { Button } from 'ant-design-vue';
import { Uri } from 'monaco-editor';
import { view } from '../../../../editor/view/control';
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
                path={`${props.path}${props.path ? '/' : ''}${props.keys}`}
            ></Table>
        );
    } else {
        const edit = () => {
            if (data.type === 'code') {
                const editor = codeList[0] ?? addCode();
                if (!editor) return;
                editor.add(
                    createCodeFile(
                        data.text,
                        'test',
                        'javascript',
                        new Uri().with({
                            path: `${props.root}://${props.path}${
                                props.path ? '/' : ''
                            }${props.keys}`
                        })
                    )
                );

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
