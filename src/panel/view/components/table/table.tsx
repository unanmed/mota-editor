import { Button } from 'ant-design-vue';
import { addCode } from '../../control';
import { CodeFile, codeList } from '../code/code';
import Table from './table.vue';

export interface TableElement {
    type: 'object' | 'code' | 'text';

    [key: string]: any;
}

export interface TableProps {
    keys: string;
    data: TableElement;
    n: number;
}

/**
 * 表格渲染器
 * @param props 数据
 */
export function TableRenderer(props: TableProps) {
    const data = props.data;

    if (data.type === 'object') {
        return <Table keys={props.keys} data={data} n={props.n}></Table>;
    } else {
        const edit = () => {
            if (data.type === 'code') {
                const editor = codeList[0] ?? addCode();
                if (!editor) return;
                editor.add(new CodeFile(data.text, 'test', 'js'));
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
