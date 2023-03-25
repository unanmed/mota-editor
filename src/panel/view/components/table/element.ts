import { Uri } from 'monaco-editor';
import { ref, Ref } from 'vue';
import { MultiItem } from '../multi/multi';
import { getTableObject } from './table';

export class TableElement<T = any> extends MultiItem<T> {
    // @ts-ignore
    value: Ref<T> = ref();

    constructor(uri: Uri, list?: TableElement<T>[]) {
        super(uri);
        this.getValue();
        if (list) list.push(this);
    }

    /**
     * 从文件中获取值
     */
    getValue() {
        this.value.value = getTableObject<T>(this.uri).content;
    }

    async save(): Promise<void> {
        await this.doSave(this.value.value);
    }

    update(content: T): void {
        this.value.value = content;
    }
}

export const checkboxList: TableElement<boolean>[] = [];
export const textList: TableElement<string>[] = [];
