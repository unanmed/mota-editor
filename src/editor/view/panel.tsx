import { Pane, Splitpanes } from 'splitpanes';
import { SplitPanel } from './control';

interface PanelProps {
    panel: SplitPanel;
}

/**
 * splitview渲染组件
 * @param props props，包含要渲染的内容等
 */
export function PanelRenderer(props: PanelProps) {
    // 用函数组件的目的是能够递归调用
    const panels = props.panel;

    return (
        <Splitpanes>
            {panels.list.map(v => {
                if (v instanceof SplitPanel) {
                    return <PanelRenderer panel={v}></PanelRenderer>;
                } else {
                    return (
                        <Pane>
                            <component
                                is={v.content}
                                v-bind={v.props}
                            ></component>
                        </Pane>
                    );
                }
            })}
        </Splitpanes>
    );
}
