import { ref, shallowReactive } from 'vue';
import { Panel } from './panel';

export class PanelController {
    list: Panel[] = shallowReactive([]);

    /**
     * 新增一个面板
     * @param panel 面板
     */
    add(panel: Panel) {
        this.list.push(panel);
    }

    /**
     * 移除一个面板
     * @param panel 面板
     */
    remove(panel: Panel) {
        const index = this.list.findIndex(v => v.num === panel.num);
        if (index === -1) return;
        this.list.splice(index, 1);
    }
}

export const sidebar = ref(true);
export const bottombar = ref(true);

export const view = new PanelController();
export let content: HTMLDivElement;

window.addEventListener('load', () => {
    content = document.getElementById('main-content') as HTMLDivElement;
});
