import { debounce } from 'lodash';
import { Uri } from 'monaco-editor';
import { ref, Ref, shallowReactive } from 'vue';
import { EventEmitter } from '../../../../editor/utils/event';
import { Panel } from '../../../../editor/view/panel';

interface MultiControllerEvent {
    select: (...params: any[]) => void;
    remove: (...params: any[]) => void;
}

export abstract class MultiController<
    Item extends MultiItem = MultiItem
> extends EventEmitter<MultiControllerEvent> {
    protected static num = 0;

    selectStack: string[] = [];

    list: Item[] = shallowReactive([]);
    selected: Ref<number> = ref(-1);

    panel?: Panel;
    added: boolean = false;

    readonly num = MultiController.num++;

    abstract add(content: any): any;

    abstract close(): void;

    remove(index: number, ...params: any[]) {
        const item = this.list[index];
        this.emit('remove', index, ...params);
        this.list.splice(index, 1);
        this.selectStack = this.selectStack.filter(
            v => v !== item.uri.toString()
        );
        if (this.selected.value === index) {
            const index = this.indexOf(this.selectStack.pop() ?? '');
            if (this.list[index]) this.select(index);
        }
    }

    indexOf(uri: Uri | string | Item) {
        if (typeof uri === 'string') {
            return this.list.findIndex(v => v.uri.toString() === uri);
        } else if (uri instanceof Uri) {
            return this.list.findIndex(
                v => v.uri.toString() === uri.toString()
            );
        } else {
            return this.list.indexOf(uri);
        }
    }

    select(index: number, ...params: any[]) {
        const file = this.list[index];
        this.emit('select', index, ...params);
        this.selectStack.push(file.uri.toString());
        if (this.selectStack.length > 50) this.selectStack.shift();
        this.selected.value = index;
        this.panel?.focus();
    }
}

interface MultiItemEvent<Content = any> {
    save: (content: Content) => Promise<boolean>;
}

export abstract class MultiItem<Content = any, Event = {}> extends EventEmitter<
    MultiItemEvent<Content> & Event
> {
    uri: Uri;

    canWatch: boolean = true;

    enableWatch = debounce(() => {
        this.canWatch = true;
    }, 750);

    constructor(uri: Uri) {
        super();
        this.uri = uri;
    }

    abstract save(content?: Content): void;

    abstract update(content: Content): void;

    protected async doSave(content: Content) {
        this.canWatch = false;
        let success = true;
        if (!this.event.save) return true;
        for await (const fn of this.event.save!) {
            if (!(await fn(content))) success = false;
        }
        this.enableWatch();
        return success;
    }
}
