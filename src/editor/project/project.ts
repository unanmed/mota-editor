import { Uri } from 'monaco-editor';
import { ref, Ref } from 'vue';
import type {
    MotaProjectData,
    ProjectInfo as Info
} from '../../../electron/process/editor/project/project';

import {
    Selection,
    selectionList
} from '../../panel/view/components/select/select';
import {
    getTableObject,
    TableElement
} from '../../panel/view/components/table/table';
import { EventEmitter } from '../utils/event';
import { SocketHandler, WebSocketMessageData } from './socket';
import { emitFileChange, updateMainData } from './update/main';
import { onEventConfigChange } from './update/eventConfig';

export const tables: Record<string, TableElement> = {};
export const watchFolders: Record<string, string> = {};

(async function () {
    const data = (await window.editor.extra.get(
        'table/data.json',
        'utf-8'
    )) as string;
    tables.data = JSON.parse(data);
})().then(() => {
    const parse = (key: string, data: TableElement, scheme: string) => {
        if (data.type === 'object') {
            for (const [k, value] of Object.entries<TableElement>(data.data)) {
                parse(`${key}.${k}`, value, scheme);
            }
            return;
        }

        if (data.type === 'select' && data.target === 'file') {
            const uri = new Uri().with({ scheme, path: key });
            watchFolders[data.path] = uri.toString();
        }
    };
    parse('data', tables.data, 'data');
});

interface ProjectEvent {
    mainDataChange: (data: DataCore) => void;
    fileChange: (path: string, uri: string) => void;
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
        this.onTableChange();
        this.onFileChange();
    }

    close() {}

    setupSocket() {
        this.socket.on('change', (data, e) => this.handleChange(data));
        this.socket.on('add', (data, e) => this.handleAdd(data));
        this.socket.on('remove', (data, e) => this.handleRemove(data));
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
            this.emit(
                'mainDataChange',
                this.parseJSONEDMotaData(data.content.data as string)
            );
        }
        onEventConfigChange(data);
    }

    private handleAdd(data: WebSocketMessageData['add']) {
        emitFileChange(data.file, this);
        onEventConfigChange(data);
    }

    private handleRemove(data: WebSocketMessageData['remove']) {
        emitFileChange(data.file, this);
        onEventConfigChange(data);
    }

    private onTableChange() {
        // 全塔属性
        this.on('mainDataChange', data => {
            projectInfo.name.value = this.mainData.firstData.name;
            projectInfo.title.value = this.mainData.firstData.title;
            projectInfo.version.value = this.mainData.firstData.version;

            updateMainData(data);
        });
    }

    private onFileChange() {
        this.on('fileChange', (path, uri) => {
            // 选项编辑器
            selectionList.forEach(async v => {
                const selection = v.list.find(v => v.uri.toString() === uri);
                if (!selection || selection.info.target !== 'file') return;
                if (!selection.canWatch) return;
                const selected = getTableObject(Uri.parse(uri));

                await selection.parseFile();
                selection.updateSelected(selected.content);
            });
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
