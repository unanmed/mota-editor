import { ref, Ref } from 'vue';
import type { MotaProjectData } from '../../../electron/process/editor/project/project';

export class Project {
    name: string;
    title: string;
    version: string;

    /** 项目信息 */
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
        this.name = this.mainData.firstData.name;
        this.title = this.mainData.firstData.title;
        this.version = this.mainData.firstData.version;
        projectInfo.name.value = this.name;
        projectInfo.title.value = this.title;
        projectInfo.version.value = this.version;
    }

    close() {}
}

interface ProjectInfo {
    project?: Project;
    name: Ref<string>;
    title: Ref<string>;
    version: Ref<string>;
}

export const projectInfo: ProjectInfo = {
    name: ref('未打开项目'),
    title: ref(''),
    version: ref('')
};
