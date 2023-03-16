import { Project } from './project';

type FileChangeEncoding = 'Text' | 'Buffer';
type FileChangeType = 'add' | 'change';

export interface WebSocketMessageData {
    connected: {
        type: 'connected';
    };
    add: WebSocketAddOrChangeData<'add'>;
    change: WebSocketAddOrChangeData<'change'>;
    remove: {
        type: 'remove';
        file: string;
        absolute: string;
    };
}

interface WebSocketAddOrChangeData<
    T extends FileChangeType,
    E extends FileChangeEncoding = FileChangeEncoding
> {
    type: T;
    file: string;
    absolute: string;
    content: {
        type: E;
        data: E extends 'Text' ? string : number[];
    };
}

export class SocketHandler {
    project: Project;
    event: {
        [P in keyof WebSocketMessageData]?: ((
            data: WebSocketMessageData[P],
            e: MessageEvent<WebSocketMessageData[P]>
        ) => void)[];
    } = {};

    constructor(project: Project) {
        this.project = project;
    }

    async start() {
        const port = await window.editor.socket.getPort(this.project.data.path);
        if (port === -1) {
            console.error(
                "Cannot get socket port, hot reload and some other functions won't work"
            );
            return;
        }
        const ws = new WebSocket(`ws://127.0.0.1:${port}`);
        ws.addEventListener('open', () => {
            console.log(`Web socket connect successfully`);
        });
        ws.addEventListener('message', e => {
            const ev = new MessageEvent('message', {
                data: JSON.parse(e.data)
            });
            this.handleMessage(ev);
        });
    }

    handleMessage<K extends keyof WebSocketMessageData>(
        e: MessageEvent<WebSocketMessageData[K]>
    ) {
        const data = e.data;
        this.dispatch(data.type, e);
    }

    dispatch<K extends keyof WebSocketMessageData>(
        type: K,
        e: MessageEvent<WebSocketMessageData[K]>
    ) {
        this.event[type]?.forEach(v => v(e.data, e));
    }

    on<K extends keyof WebSocketMessageData>(
        type: K,
        fn: (
            data: WebSocketMessageData[K],
            e: MessageEvent<WebSocketMessageData[K]>
        ) => void
    ) {
        this.event[type] ??= [];
        this.event[type]!.push(fn);
    }
}
