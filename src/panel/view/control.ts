import { view } from '../../editor/view/control';
import { projectInfo, tables } from '../../editor/project/project';
import { Panel } from '../../editor/view/panel';
import { TableElement } from './components/table/table';
import { CodeController } from './components/code/code';
import { SelectionController } from './components/select/select';
import { EventConfigController } from './components/event/config/config';

export function addData() {
    if (!projectInfo.project) return alert('请先打开一个魔塔项目');
    view.add(
        new Panel('table', '全塔属性', {
            keys: 'data',
            data: tables.data,
            n: 0,
            root: 'data',
            path: '',
            memo: true
        })
            .setDefaultSize(500, 500)
            .setMaxSize(1000)
            .focus()
    );
}

export function addCode() {
    if (!projectInfo.project) return alert('请先打开一个魔塔项目');
    const code = new CodeController();
    showCode(code);
    return code;
}

export function showCode(code: CodeController) {
    const panel = new Panel('code', '代码编辑器', code);
    code.panel = panel;
    view.add(
        panel
            .setMinSize(400)
            .setDefaultSize(800, 500)
            .focus()
            .setStyle('overflow: visible;')
    );
    code.added = true;
}

export function addSelection() {
    if (!projectInfo.project) return alert('请先打开一个魔塔项目');
    const selection = new SelectionController();
    showSelection(selection);
    return selection;
}

export function showSelection(selection: SelectionController) {
    const panel = new Panel('select', '选项编辑器', selection);
    selection.panel = panel;
    view.add(panel.setMinSize(400).setDefaultSize(600, 500).focus());
    selection.added = true;
}

export function openConfig() {
    const panel = new Panel('config', '编辑器配置', null);
    view.add(panel.setDefaultSize(500, 500).focus());
}

export function openEventConfig() {
    const config = new EventConfigController();
    const panel = new Panel('eventConfig', '事件编辑器配置', config);
    view.add(panel.setDefaultSize(700, 500).focus());
    config.panel = panel;
    config.added = true;
    return config;
}
