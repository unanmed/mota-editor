import { Uri } from 'monaco-editor';
import { ref, Ref } from 'vue';
import { MultiItem } from '../../multi/multi';
import { getTableObject } from '../table';

export class TableCheckbox extends MultiItem<boolean> {
    checked: Ref<boolean> = ref(false);

    constructor(uri: Uri) {
        super(uri);
        checkboxList.push(this);
        this.getValue();
    }

    /**
     * 从文件中获取值
     */
    getValue() {
        this.checked.value = getTableObject<boolean>(this.uri).content;
    }

    async save(): Promise<void> {
        await this.doSave(this.checked.value);
    }

    update(content: boolean): void {
        this.checked.value = content;
    }
}

export const checkboxList: TableCheckbox[] = [];
