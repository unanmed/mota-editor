import { CloseOutlined } from '@ant-design/icons-vue';
import { TableRenderer } from '../../panel/view/components/table';
import { PanelProps, PanelType } from './panel';

interface PanelViewProps<T extends PanelType> {
    type: T;
    name: string;
    props: PanelProps[T];
}

export function Panel<T extends PanelType>(props: PanelViewProps<T>) {
    const { name, type, props: p } = props;

    if (type === 'table') {
        return (
            <TableRenderer
                style="overflow-x: hidden; overflow-y: auto"
                keys={p.keys ?? 'default'}
                data={p.data}
                n={0}
            ></TableRenderer>
        );
    }
    return <div></div>;
}
