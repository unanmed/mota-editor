import type { MotaProjectData } from '../../../electron/process/editor/project/project';

export class Project {
    data: MotaProjectData;
    /** 全塔属性 */
    mainData: DataCore;

    constructor(data: MotaProjectData) {
        this.data = data;
        const mainData = data.mainInfo[0];
        this.mainData = JSON.parse(
            mainData.content
                .split(/(\n|\r\n)/)
                .slice(1)
                .join('')
        );
    }

    close() {}
}

interface ProjectInfo {
    project?: Project;
}

export const projectInfo: ProjectInfo = {};
