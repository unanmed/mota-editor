import { debounce } from 'lodash';
import { Uri } from 'monaco-editor';
import { ref, Ref, shallowReactive } from 'vue';
import { EventEmitter } from '../../../../editor/utils/event';
import { Panel } from '../../../../editor/view/panel';

export abstract class MultiController<Item extends MultiItem = MultiItem> {
    protected static num = 0;

    list: Item[] = shallowReactive([]);
    selected: Ref<number> = ref(-1);

    panel?: Panel;
    added: boolean = false;

    readonly num = MultiController.num++;

    abstract add(content: any): any;

    abstract remove(content: any): any;

    abstract close(): void;

    indexOf(uri: Uri | string | Item) {
        if (typeof uri === 'string') {
            return this.list.findIndex(v => v.uri.path === uri);
        } else if (uri instanceof Uri) {
            return this.list.findIndex(
                v => v.uri.toString() === uri.toString()
            );
        } else {
            return this.list.indexOf(uri);
        }
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
    }, 100);

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
