import { CloseOutlined } from '@ant-design/icons-vue';
import {
    TableProps,
    TableRenderer
} from '../../panel/view/components/table/table';
import { PanelProps, PanelType } from './panel';
import Code from '../../panel/view/components/code/code.vue';
import Select from '../../panel/view/components/select/select.vue';
import Config from '../../panel/view/components/config/config.vue';
import EventConfig from '../../panel/view/components/event/config/config.vue';
import { CodeController } from '../../panel/view/components/code/code';
import { SelectionController } from '../../panel/view/components/select/select';

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
                keys={(p as TableProps).keys ?? 'default'}
                data={(p as TableProps).data}
                n={0}
                root={(p as TableProps).root}
                path={''}
            ></TableRenderer>
        );
    } else if (type === 'code') {
        return <Code code={p as CodeController} panelNum={props.num}></Code>;
    } else if (type === 'select') {
        return <Select selection={p as SelectionController}></Select>;
    } else if (type === 'config') {
        return <Config></Config>;
    } else if (type === 'eventConfig') {
        return <EventConfig config={p}></EventConfig>;
    }
    return <div></div>;
}
