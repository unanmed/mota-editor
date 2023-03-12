import fs from 'fs';
import { readdir, stat } from 'fs/promises';
import { throttle } from 'lodash';
import { resolve } from 'path';

type MotaWatchType = 'change' | 'add' | 'remove';
type MotaWatchFn = (file: string) => void;

export class MotaProjectWatcher {
    path: string;
    watcher?: fs.FSWatcher;

    event: {
        [P in MotaWatchType]?: MotaWatchFn[];
    } = {};

    private folders: Record<string, string[]> = {};

    constructor(path: string) {
        this.path = path;
        this.initFolder();
    }

    /**
     * 开始执行监听
     */
    start() {
        this.watcher = fs.watch(this.path, { recursive: true });
        this.addChangeEvent();
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

    private async initFolder() {
        const checkFolder = async (path: string) => {
            if (path.includes('node_modules') || path.includes('.git')) return;
            const state = await stat(path);
            if (!state.isFile()) {
                const dir = await readdir(path);
                this.folders[path] = dir;
                await Promise.all(dir.map(v => checkFolder(resolve(path, v))));
            }
        };
        await checkFolder(this.path);
    }

    private addChangeEvent() {
        if (!this.watcher) return;
        let toEmit: string[] = [];
        const change = throttle(
            () => {
                toEmit.forEach(v => {
                    this.onChange(v);
                });
                toEmit = [];
            },
            200,
            {
                leading: false
            }
        );
        this.watcher.on('change', (e, f) => {
            if (e !== 'change' || typeof f !== 'string') return;
            if (!toEmit.includes(f)) toEmit.push(f);
            change();
        });
    }

    private async onChange(file: string) {
        if (file.includes('node_modules') || file.includes('.git')) return;
        const path = resolve(this.path, file);
        const state = await stat(path);
        if (state.isFile()) {
            // 文件，执行change事件
            this.event.change?.forEach(v => v(file));
        } else {
            // 文件夹，检测文件增加和减少
            const before = this.folders[path] ?? [];
            const now = await readdir(path);
            this.folders[path] = now.slice();
            const add = before.length === 0 ? this.folders[path] : [];
            const sameIndex: number[] = [];
            now.forEach(v => {
                const index = before.indexOf(v);
                if (index !== -1) {
                    sameIndex.push(index);
                } else {
                    add.push(v);
                }
            });
            const remove = before.filter((v, i) => !sameIndex.includes(i));
            remove.forEach(v => {
                this.event.remove?.forEach(vv => vv(v));
            });
            add.forEach(v => {
                this.event.add?.forEach(vv => vv(v));
            });
        }
    }
}
