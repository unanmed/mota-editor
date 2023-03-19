import { Uri } from 'monaco-editor';
import { ref, Ref, shallowReactive } from 'vue';
import { EventEmitter } from '../../../../editor/utils/event';

export abstract class MultiController<Item extends MultiItem> {
    list: Item[] = shallowReactive([]);
    selected: Ref<number> = ref(-1);

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

    constructor(uri: Uri) {
        super();
        this.uri = uri;
    }

    abstract save(content?: Content): void;
}
