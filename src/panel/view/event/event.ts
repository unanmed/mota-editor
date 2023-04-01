import { EventEmitter } from '../../../editor/utils/event';
import { MultiController, MultiItem } from '../components/multi/multi';
import { EventParams } from './params';

export type MotaEventData = string | { type: string };

export type MotaEventParamType =
    | 'number'
    | 'text'
    | 'code'
    | 'json'
    | 'checkbox'
    | 'select'
    | 'color';

export interface MotaEventParamError {
    regexp: string;
    throw: string[];
}

export interface MotaEventParam {
    type: MotaEventParamType;
    text?: string;
    key?: string;
    default?: any;
    error?: MotaEventParamError[];

    _value?: any;

    [key: string]: any;
}

export interface MotaEventDblClickData {
    event: string;

    [key: string]: any;
}

export interface MotaEventInfo {
    type: string;
    text?: string;
    params?: (MotaEventParam | string)[];
    dblClick?: MotaEventDblClickData[];
    format?: string[];
}

interface MotaEventHandler {}

export class MotaEvent extends EventEmitter<MotaEventHandler> {
    entry!: MotaEventOne;

    constructor(type?: string) {
        super();
        if (type) this.entry = new MotaEventOne(type);
    }

    /**
     * 转成json
     */
    toJSON() {}

    /**
     * 设置事件的值，可以是json，事件块
     * @param value 设置成的值
     */
    set(value: any) {}

    /**
     * 从一个json生成事件
     * @param value json内容
     */
    static fromJSON(value: any) {
        const event = new MotaEvent();
        event.set(value);
        return event;
    }
}

class MotaEventOne<T extends string = string> {
    /** 事件类型 */
    type: T;
    /** 事件参数 */
    params: EventParams = new EventParams();
    /** 用于v-memo优化 */
    updateNum = 0;

    constructor(type: T) {
        this.type = type;
    }

    /**
     * 从json解析出事件块
     * @param value 要解析的json
     */
    static parse(value: any) {}
}
