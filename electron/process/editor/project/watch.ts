import { relative, resolve } from 'path';
import chokidar from 'chokidar';

type MotaWatchType = 'change' | 'add' | 'remove';
type MotaWatchFn = (file: string, abs: string) => void;

export class MotaProjectWatcher {
    path: string;
    watcher?: chokidar.FSWatcher;

    event: {
        [P in MotaWatchType]?: MotaWatchFn[];
    } = {};

    constructor(path: string) {
        this.path = path;
    }

    /**
     * 开始执行监听
     */
    start() {
        this.watcher = chokidar.watch(this.path, {
            persistent: true,
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/extensions/ui-editor/**',
                '**/thirdparty/**',
                '**/_docs/**',
                '**/_save/**',
                '**/_ui/**',
                /\.min\./,
                /(^|[\/\\])\../,
                /(^|[\/\\])[^a-zA-Z:\._0-9\/\\]/
            ]
        });
        let ready = false;
        setTimeout(() => (ready = true), 1000);
        this.watcher.on('all', (e, f) => {
            if (!ready) return;
            if (e === 'add') {
                this.dispatch('add', f);
            } else if (e === 'unlink') {
                this.dispatch('remove', f);
            } else if (e === 'change') {
                this.dispatch('change', f);
            }
        });
    }

    dispatch(type: MotaWatchType, file: string) {
        this.event[type]?.forEach(v => v(relative(this.path, file), file));
    }

    /**
     * 退出监听
     */
    exit() {
        this.watcher?.close();
    }

    /**
     * 添加监听事件
     * @param type 事件类型，添加或删除或改变
     * @param fn 执行的函数
     */
    on<T extends MotaWatchType>(type: T, fn: MotaWatchFn) {
        this.event[type] ??= [];
        this.event[type]!.push(fn);
    }

    off(type: 'all') {
        this.event = {};
    }
}
