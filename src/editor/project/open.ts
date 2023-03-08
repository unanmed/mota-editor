import { addData } from '../../panel/view/control';
import { Project, projectInfo } from './project';

export async function selectProject() {
    projectInfo.project?.close();
    const pro = await window.editor.project.select();
    if (typeof pro === 'string') {
        alert(pro);
        return;
    }
    projectInfo.project = new Project(pro);
    addData();
}
