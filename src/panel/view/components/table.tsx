import { Button } from 'ant-design-vue';
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
        return (
            <div class={'table-one'}>
                <span class={'table-key'}>{props.keys}</span>
                <span class={'table-text'}>{data.text ?? ''}</span>
                <span class={'table-edit'}>
                    <Button style="font-size: 16px">编辑</Button>
                </span>
            </div>
        );
    }
}
