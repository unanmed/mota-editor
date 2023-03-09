import { view } from '../../editor/view/control';
import data from '../../editor/table/data.json';
import { projectInfo } from '../../editor/project/project';
import { Panel } from '../../editor/view/panel';
import { TableElement } from './components/table';

const tables: Record<string, TableElement> = {};

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
            n: 0
        })
            .setDefaultSize(500, 500)
            .setMaxSize(750)
            .focus()
    );
}
