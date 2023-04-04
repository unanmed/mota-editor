import { assignWithCheck } from '../../../editor/utils/utils';
import { MotaEventBlock, MotaEventDefaults } from './config';
import { MotaEventInfo, MotaEventParamType } from './event';

interface ParsedDefaults {
    param: Partial<Record<MotaEventParamType, any>>;
    block: Record<string, any>;
}

interface ParsedEvent {
    id: string;
    text: string;
    color: string;
    data: string[];
}

interface ClassifiedEvent {
    cls: Record<string, ParsedEvent>;
    map: Record<string, string>;
    typeMap: Record<string, string>;
}

export const defaults: ParsedDefaults = {
    param: {},
    block: {}
};
export const events: Record<string, MotaEventInfo> = {};
export const classified: ClassifiedEvent = {
    cls: {},
    map: {},
    typeMap: {}
};

export async function loadEventJSON() {
    const dir = `_editor/event`;
    const files = await window.editor.extra.readl(dir, 'event', 'utf-8');

    for (const [name, content] of files) {
        try {
            const data = JSON.parse(content);
            if (data.type === 'eventBlock') handleBlock(data, name);
            if (data.type === 'paramDefaults') handleDefaults(data);
        } catch (e) {
            console.error(
                `Cannot parse event config data '${name}'. Error log:`,
                e
            );
        }
    }
}

function handleDefaults(data: MotaEventDefaults) {
    assignWithCheck(defaults.param, false, data.data);
    assignWithCheck(defaults.block, false, data.blockData);
}

function handleBlock(data: MotaEventBlock, name: string) {
    const id = data.id ?? name;
    const cls = (classified.cls[id] ??= {
        id,
        color: data.color ?? '#929',
        text: data.text ?? '未分类事件',
        data: []
    });
    for (const [key, value] of Object.entries(data.data)) {
        if (!value.type) {
            console.warn(`No event type in event '${key}'.`);
            continue;
        }
        cls.data.push(key);
        if (key in classified.map) {
            console.warn(`Repeated event key or type: '${key}'.`);
            continue;
        }
        classified.map[key] = id;
        classified.typeMap[value.type] = key;
    }
}

export function getEventByType(type: string) {
    return events[classified.typeMap[type]];
}

export function getEventById(id: string) {
    return events[id];
}
