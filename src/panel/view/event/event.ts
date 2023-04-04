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
    | 'colors'
    | 'colora'
    | 'comment'
    | 'block';

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
    params?: MotaEventParam[];
    dblClick?: MotaEventDblClickData[];
    format?: string[];
}

export const typeName: Record<MotaEventParamType, string> = {
    number: '数字',
    checkbox: '布尔值',
    code: 'js代码',
    json: 'json对象',
    select: '单选框',
    colors: '字符串颜色',
    colora: '数组型颜色',
    comment: '文字说明',
    text: '字符串',
    block: '子事件块'
};

interface MotaEventEmitter {}

export class MotaEvent extends EventEmitter<MotaEventEmitter> {
    static parse(event: any) {}

    set(event: any) {}

    parse() {}
}
