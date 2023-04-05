import { Uri } from 'monaco-editor';
import {
    EventBlockConfig,
    EventConfig,
    EventParamDefaults,
    EventParserConfig
} from '../../../event/config';
import { MultiController, MultiItem } from '../../multi/multi';
import { projectInfo } from '../../../../../editor/project/project';

export class EventConfigController extends MultiController<EventConfig> {
    constructor() {
        super();
        this.getAllConfig();
    }

    async getAllConfig() {
        const list = await window.editor.extra.readl(
            '_editor/event',
            'event',
            'utf-8'
        );
        list.forEach(v => {
            const config = parseConfig(v[0], v[1]);

            if (!config) return;
            this.add(config);
        });
        this.select(0);
    }

    add(content: EventConfig) {
        const index = this.list.indexOf(content);
        if (index !== -1) {
            this.select(index);
        } else {
            this.list.push(content);
        }
    }

    close(): void {}
}

function parseConfig(name: string, config: string): EventConfig | undefined {
    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: `_editor/event/${name}`
    });
    if (name.endsWith('json')) {
        // json格式
        const json = JSON.parse(config);

        if (json.type === 'paramDefaults') {
            return new EventParamDefaults('paramDefaults', name, uri).set({
                data: json.data,
                blockData: json.blockData
            });
        } else if (json.type === 'eventBlock') {
            return new EventBlockConfig('eventBlock', name, uri).set({
                data: json.data,
                id: json.id,
                color: json.color ?? null,
                text: json.text ?? null
            });
        } else {
            console.warn(`Unknown event config type: '${json.type}'.`);
            return;
        }
    } else {
        return new EventParserConfig('eventParser', name, uri).set({
            data: config
        });
    }
}
