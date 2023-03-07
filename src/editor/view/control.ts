import { Component, shallowReactive } from 'vue';
import { Splitpanes, Pane, SplitpaneProps, PaneProps } from 'splitpanes';

interface Panel {
    content: Component;
    props: Partial<PaneProps>;
}

type EditorPanel = Panel | SplitPanel;

export class SplitPanel {
    list: EditorPanel[] = shallowReactive([]);
    type: 'vertical' | 'horizontal' = 'horizontal';
    props: Partial<SplitpaneProps> = {};

    /**
     * 新增一个面板
     * @param panel 面板
     */
    add(panel: EditorPanel) {
        this.list.push(panel);
    }

    /**
     * 移除一个面板
     * @param panel 面板
     */
    remove(panel: EditorPanel) {
        const index = this.list.indexOf(panel);
        if (index === -1) return;
        this.list.splice(index, 1);
    }
}
