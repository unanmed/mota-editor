import { Uri } from 'monaco-editor';
import { MotaEventInfo, MotaEventParamType } from './event';
import { projectInfo } from '../../../editor/project/project';
import { MultiItem } from '../components/multi/multi';
import { reactive, ref } from 'vue';
import { debounce } from 'lodash';

export type EventConfigType = keyof MotaEventConfigMap;

export interface MotaEventDefaults {
    type: 'paramDefaults';
    data: Partial<Record<MotaEventParamType, any>>;
    specific: Record<string, any>;
}

export interface MotaEventBlock {
    type: 'eventBlock';
    id: string;
    data: Record<string, MotaEventInfo>;
    color?: string;
    text?: string;
}

export interface MotaEventParser {
    type: 'eventParser';
    data: string;
}

export interface MotaEventConfigMap {
    paramDefaults: MotaEventDefaults;
    eventBlock: MotaEventBlock;
    eventParser: MotaEventParser;
}

export abstract class EventConfig<
    T extends EventConfigType = EventConfigType
> extends MultiItem<string> {
    type: T;
    name: string;

    canWatch: boolean = true;

    constructor(type: T, name: string, uri: Uri) {
        super(uri);
        this.type = type;
        this.name = name;
        this.on('save', this.onsave);
    }

    abstract toJSON(): string;

    save = () => {
        const content = this.toJSON();
        this.doSave(content);
    };

    emitSave = debounce(this.save, 500);

    set(config: Partial<Omit<MotaEventConfigMap[T], 'type'>>): this {
        Object.assign(this, config);
        return this;
    }

    onsave = async (content: any) => {
        const path = projectInfo.project!.data.path + '/' + this.uri.path;
        window.editor.file.write(path, content, 'utf-8');
        return true;
    };
}

export class EventParamDefaults extends EventConfig<'paramDefaults'> {
    data: Omit<MotaEventDefaults, 'type'> = reactive({
        data: {},
        specific: {}
    });

    toJSON() {
        return JSON.stringify(
            {
                type: this.type,
                data: this.data.data,
                specific: this.data.specific
            },
            void 0,
            4
        );
    }

    update(content: any): void {}
}

export class EventBlockConfig extends EventConfig<'eventBlock'> {
    data: Omit<MotaEventBlock, 'type'> = reactive({
        id: 'entry',
        data: {}
    });

    toJSON(): string {
        const obj: MotaEventBlock = {
            id: this.data.id,
            data: this.data.data,
            type: this.type
        };
        if (this.data.color) obj.color = this.data.color;
        if (this.data.text) obj.text = this.data.text;
        return JSON.stringify(obj, void 0, 4);
    }

    set(config: Partial<Omit<MotaEventBlock, 'type'>>): this {
        Object.assign(this.data, config);
        return this;
    }

    update(content: string): void {
        const json = JSON.parse(content);

        for (const [key, value] of Object.entries(json)) {
            // @ts-ignore
            this.data[key] = value;
        }
    }
}

export class EventParserConfig extends EventConfig<'eventParser'> {
    data: string = '';

    toJSON(): string {
        return this.data;
    }

    update(content: string): void {}
}
