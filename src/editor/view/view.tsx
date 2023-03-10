import { CloseOutlined } from '@ant-design/icons-vue';
import {
    TableProps,
    TableRenderer
} from '../../panel/view/components/table/table';
import { PanelProps, PanelType } from './panel';
import Code from '../../panel/view/components/code/code.vue';
import { CodeController } from '../../panel/view/components/code/code';

interface PanelViewProps<T extends PanelType> {
    type: T;
    name: string;
    num: number;
    props: PanelProps[T];
}

export function Panel<T extends PanelType>(props: PanelViewProps<T>) {
    const { name, type, props: p } = props;

    if (type === 'table') {
        return (
            <TableRenderer
                style="overflow-x: hidden; overflow-y: auto"
                keys={(p as TableProps).keys ?? 'default'}
                data={(p as TableProps).data}
                n={0}
                root={(p as TableProps).root}
                path={''}
            ></TableRenderer>
        );
    } else if (type === 'code') {
        return <Code code={p as CodeController} panelNum={props.num}></Code>;
    }
    return <div></div>;
}
