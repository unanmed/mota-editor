import { ref, Ref } from 'vue';
import type { MotaProjectData } from '../../../electron/process/editor/project/project';
import {
    CodeFile,
    codeList,
    getFormatedString
} from '../../panel/view/components/code/code';
import { getTableObject } from '../../panel/view/components/table/table';
import { SocketHandler, WebSocketMessageData } from './socket';

interface ProjectEvent {
    mainDataChange: (data: DataCore) => void;
}

export class Project {
    name: string;
    title: string;
    version: string;
    socket: SocketHandler;

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
        this.socket = new SocketHandler(this);
        this.socket.start().then(() => this.setupSocket());

        this.setup();
    }

    setup() {
        this.watchTableChange();
    }

    close() {}

    on<K extends keyof ProjectEvent>(type: K, fn: ProjectEvent[K]) {
        this.events[type] ??= [];
        this.events[type]!.push(fn);
    }

    dispatch<K extends keyof ProjectEvent>(event: K, params: any) {
        this.events[event]?.forEach(v => v(params));
    }

    setupSocket() {
        this.socket.on('change', (data, e) => this.handleChange(data));
    }

    private parseJSONEDMotaData(content: string) {
        return JSON.parse(
            content
                .split(/(\n|\r\n)/)
                .slice(1)
                .join('')
        );
    }

    private handleChange(data: WebSocketMessageData['change']) {
        // 全塔属性
        if (/project(\/|\\)+data.js/.test(data.file)) {
            const mainData = this.parseJSONEDMotaData(
                data.content.data as string
            );
            this.mainData = mainData;
            this.dispatch('mainDataChange', mainData);
        }
    }

    private watchTableChange() {
        // 全塔属性
        this.on('mainDataChange', data => {
            const check = (list: CodeFile[]) => {
                list.forEach(v => {
                    if (!v.saved.value) return;
                    if (v.uri.scheme !== 'data') return;
                    const content = getTableObject(v.uri, { data });
                    const text = getFormatedString(
                        content.content,
                        content.info.type as 'json' | 'code' | 'text'
                    );
                    v.model.setValue(text);
                    v.saved.value = true;
                });
            };
            codeList.forEach(v => check(v.fileList));
        });
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
