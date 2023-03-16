import { view } from '../../editor/view/control';
import { projectInfo } from '../../editor/project/project';
import { Panel } from '../../editor/view/panel';
import { TableElement } from './components/table/table';
import { CodeFile, CodeController } from './components/code/code';

export const tables: Record<string, TableElement> = {};

(async function () {
    const data = (await window.editor.extra.get(
        'table/data.json',
        'utf-8'
    )) as string;
    tables.data = JSON.parse(data);
})();

export function addData() {
    if (!projectInfo.project) return alert('请先打开一个魔塔项目');
    view.add(
        new Panel('table', '全塔属性', {
            keys: 'data',
            data: tables.data,
            n: 0,
            root: 'data',
            path: ''
        })
            .setDefaultSize(500, 500)
            .setMaxSize(750)
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
    view.add(panel.setMinSize(400).setDefaultSize(800, 500).focus());
    code.added = true;
}
