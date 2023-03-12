import { ref, Ref } from 'vue';
import type { MotaProjectData } from '../../../electron/process/editor/project/project';

interface ProjectEvent {
    mainDataChange: (data: DataCore) => void;
}

export class Project {
    name: string;
    title: string;
    version: string;

    events: {
        [K in keyof ProjectEvent]?: ProjectEvent[K][];
    } = {};

    /** 项目信息 */
    data: MotaProjectData;
    /** 全塔属性 */
    mainData: DataCore;

    constructor(data: MotaProjectData) {
        this.data = data;
        const mainData = data.mainInfo[0];
        this.mainData = this.parseJSONEDMotaData(mainData.content);
        this.name = this.mainData.firstData.name;
        this.title = this.mainData.firstData.title;
        this.version = this.mainData.firstData.version;
        projectInfo.name.value = this.name;
        projectInfo.title.value = this.title;
        projectInfo.version.value = this.version;

        window.editor.project.sendProjectInfo(this.data.path);

        // 执行监听
        this.doWatch();
    }

    close() {}

    on<K extends keyof ProjectEvent>(type: K, fn: ProjectEvent[K]) {
        this.events[type] ??= [];
        this.events[type]!.push(fn);
    }

    dispatch<K extends keyof ProjectEvent>(event: K, params: any) {
        this.events[event]?.forEach(v => v(params));
    }

    private doWatch() {
        // 全塔属性
        // ipcRenderer.on('mainDataChange', (e, content: string) => {
        //     this.data.mainInfo[0].content = content;
        //     this.mainData = this.parseJSONEDMotaData(content);
        //     this.dispatch('mainDataChange', this.mainData);
        // });
    }

    private parseJSONEDMotaData(content: string) {
        return JSON.parse(
            content
                .split(/(\n|\r\n)/)
                .slice(1)
                .join('')
        );
    }
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
