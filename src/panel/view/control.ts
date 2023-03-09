import { view } from '../../editor/view/control';
import data from '../../editor/table/data.json';
import { projectInfo } from '../../editor/project/project';
import { Panel } from '../../editor/view/panel';
import { TableElement } from './components/table';

export function addData() {
    if (!projectInfo.project) return alert('请先打开一个魔塔项目');
    const d = data as TableElement;
    view.add(
        new Panel('table', '全塔属性', {
            keys: 'data',
            data: d,
            n: 0
        })
            .setDefaultSize(500, 500)
            .setMaxSize(750)
    );
}
