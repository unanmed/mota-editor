import { ref, Ref } from 'vue';
import { TableProps } from '../../panel/view/components/table';

export type PanelType = 'table';

export interface PanelProps {
    table: TableProps;
}

export class Panel<T extends PanelType = PanelType> {
    private static num = 0;

    type: PanelType;
    name: string;
    props: PanelProps[T];
    width!: number;
    height!: number;
    maxWidth?: number;
    maxHeight?: number;
    toped: boolean = false;

    zIndex: Ref<number> = ref(0);
    focused: Ref<boolean> = ref(false);

    readonly num: number = Panel.num++;

    constructor(type: PanelType, name: string, props: PanelProps[T]) {
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
}
