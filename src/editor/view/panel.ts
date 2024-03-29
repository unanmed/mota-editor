import { ref, Ref } from 'vue';
import { CodeController } from '../../panel/view/components/code/code';
import { SelectionController } from '../../panel/view/components/select/select';
import { TableProps } from '../../panel/view/components/table/table';
import { view } from './control';
import { EventConfigController } from '../../panel/view/components/event/config/config';

export type PanelType = keyof PanelProps;

export interface PanelProps {
    table: TableProps;
    code: CodeController;
    select: SelectionController;
    config: null;
    eventConfig: EventConfigController;
}

export class Panel<T extends PanelType = PanelType> {
    private static num = 0;

    type: PanelType;
    name: string;
    props: PanelProps[T];
    style: Ref<string> = ref('');
    width!: number;
    height!: number;
    maxWidth?: number;
    maxHeight?: number;
    minWidth: number = 200;
    minHeight: number = 100;
    toped: boolean = false;

    zIndex: Ref<number> = ref(0);
    focused: Ref<boolean> = ref(false);

    readonly num: number = Panel.num++;

    constructor(type: T, name: string, props: PanelProps[T]) {
        this.type = type;
        this.name = name;
        this.props = props;
    }

    setDefaultSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        return this;
    }

    setMaxSize(width?: number, height?: number) {
        width && (this.maxWidth = width);
        height && (this.maxHeight = height);
        return this;
    }

    setMinSize(width?: number, height?: number) {
        width && (this.minWidth = width);
        height && (this.minHeight = height);
        return this;
    }

    setStyle(style: string) {
        this.style.value = style;
        return this;
    }

    focus() {
        view.list.forEach((v, i) => {
            v.focused.value = false;
            if (!v.toped) {
                v.zIndex.value = 0;
            }
        });
        this.focused.value = true;
        this.zIndex.value = 1;
        if (this.toped) this.zIndex.value = 10;
        return this;
    }

    close() {
        view.remove(this);
    }
}
