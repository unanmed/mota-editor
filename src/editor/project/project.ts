import { reactive, ref, Ref } from 'vue';
import type {
    MotaProjectData,
    ProjectInfo as Info
} from '../../../electron/process/editor/project/project';
import {
    CodeFile,
    codeList,
    getFormatedString
} from '../../panel/view/components/code/code';
import { MultiItem } from '../../panel/view/components/multi/multi';
import {
    Selection,
    selectionList
} from '../../panel/view/components/select/select';
import {
    getTableObject,
    TableObject
} from '../../panel/view/components/table/table';
import { EventEmitter } from '../utils/event';
import { SocketHandler, WebSocketMessageData } from './socket';

interface ProjectEvent {
    mainDataChange: (data: DataCore) => void;
}

export class Project extends EventEmitter<ProjectEvent> {
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
    info: Info;

    constructor(data: MotaProjectData) {
        super();
        this.data = data;
        this.info = data.info;
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

    setupSocket() {
        this.socket.on('change', (data, e) => this.handleChange(data));
    }

    setInfo() {}

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
            this.mainData = this.parseJSONEDMotaData(
                data.content.data as string
            );

            this.emit('mainDataChange', this.mainData);
        }
    }

    private watchTableChange() {
        // 全塔属性
        this.on('mainDataChange', data => {
            projectInfo.name.value = this.mainData.firstData.name;
            projectInfo.title.value = this.mainData.firstData.title;
            projectInfo.version.value = this.mainData.firstData.version;

            updateMainData(data);
        });
    }
}

function updateMainData(data: DataCore) {
    const checkCode = (list: CodeFile[]) => {
        list.forEach(v => {
            if (!v.saved.value || !v.canWatch) return;
            if (v.uri.scheme !== 'data') return;
            const content = getTableObject(v.uri, { data });
            const text = getFormatedString(
                content.content,
                content.info.type as 'json' | 'code' | 'text'
            );
            v.update(text);
        });
    };

    const checkSelect = async (list: Selection[]) => {
        await Promise.all(
            list.map(v => {
                if (!v.canWatch) return;
                if (v.uri.scheme !== 'data') return;
                return (async () => {
                    const content = getTableObject<string[]>(v.uri, { data });
                    if (content.info.target === 'file') await v.parseFile();
                    v.updateSelected(content.content);
                })();
            })
        );
    };

    codeList.forEach(v => checkCode(v.list));
    selectionList.forEach(v => checkSelect(v.list));
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
