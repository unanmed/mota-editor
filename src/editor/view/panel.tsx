import { Pane, Splitpanes } from 'splitpanes';
import { TableRenderer } from '../../panel/view/table';
import { SplitPanel } from './control';
import { CloseOutlined } from '@ant-design/icons-vue';

interface PanelProps {
    panel: SplitPanel;
}

interface PanelOneProps {
    type: 'table';
    props: any;
}

const maxWidth = {
    table: 500
};

/**
 * splitview渲染组件
 * @param props props，包含要渲染的内容等
 */
export function PanelRenderer(props: PanelProps) {
    // 用函数组件的目的是能够递归调用
    const panels = props.panel;

    return (
        <Splitpanes class={'panel-split'}>
            {panels.list.map(v => {
                if (v instanceof SplitPanel) {
                    return <PanelRenderer panel={v}></PanelRenderer>;
                } else {
                    return (
                        <Pane>
                            <div
                                class={'panel-one'}
                                style={{
                                    maxWidth: `${maxWidth[v.content]}px`
                                }}
                            >
                                <div class={'panel-info'}>
                                    <span>{v.name}</span>
                                    <CloseOutlined class={'panel-close'} />
                                </div>
                                <Panel type={v.content} props={v.props}></Panel>
                            </div>
                        </Pane>
                    );
                }
            })}
        </Splitpanes>
    );
}

function Panel(props: PanelOneProps) {
    const type = props.type;
    if (type === 'table') {
        return (
            <TableRenderer
                style="overflow-x: hidden; overflow-y: auto; max-width: 500px"
                keys={props.props.key ?? 'default'}
                data={props.props.data}
                n={0}
            ></TableRenderer>
        );
    }
    return <div></div>;
}
