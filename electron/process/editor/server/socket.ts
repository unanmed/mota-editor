import { MotaProject } from '../project/project';
import type ws from 'ws';
import { ipcMain } from 'electron';
import { controller } from '../../window/control';
import { EditorWindow } from '../../window/editor';
import { MotaProjectWatcher } from '../project/watch';
import fs from 'fs/promises';
import { getBufferTypeByExt } from '../../../utils/extend';

// 由于未知原因（可能是vite-plugin-electron在4.0的vite的bug），使用import的话不论怎么配置都会报错
// 因此这里使用require
const { WebSocketServer } = require('ws');

export class MotaSocketServer {
    static port = 24678;

    port: number = 24678;
    server?: ws.WebSocketServer;
    root: string;
    project: MotaProject;

    socketStartPromise?: Promise<void>;

    constructor(base: string, project: MotaProject) {
        this.root = base;
        this.project = project;
    }

    async start() {
        let port = MotaSocketServer.port++;

        const wss = new WebSocketServer({ port });

        return (this.socketStartPromise = new Promise(res => {
            wss.on('listening', () => {
                this.server = wss;
                res();
            });
        }));
    }

    setup(watcher: MotaProjectWatcher) {
        const wss = this.server;
        if (!wss) return;
        wss.on('connection', (socket, req) => {
            console.log(`Get connection with port ${this.port}`);
            socket.send(JSON.stringify({ type: 'connected' }));

            watcher.off('all');
            const change = (type: string) => {
                return async (file: string, abs: string) => {
                    const newData = await fs.readFile(
                        abs,
                        getBufferTypeByExt(file)
                    );

                    const content =
                        typeof newData === 'string'
                            ? { type: 'Text', data: newData }
                            : newData;
                    const text = JSON.stringify({
                        type,
                        file,
                        absolute: abs,
                        content
                    });
                    socket.send(text);
                };
            };
            watcher.on('add', change('add'));
            watcher.on('change', change('change'));
            watcher.on('remove', (file, abs) => {
                socket.send(
                    JSON.stringify({
                        type: 'remove',
                        file,
                        absolute: abs
                    })
                );
            });
        });
    }
}

export function injectSocketInterface() {
    ipcMain.handle('socket.getPort', (e, path: string) => {
        const win = controller.list.find(
            v => v.root === path && v instanceof EditorWindow
        );
        if (!win || !(win as EditorWindow).socket) return -1;
        return (win as EditorWindow).socket!.socketStartPromise!.then(() => {
            return (win as EditorWindow).socket?.port ?? -1;
        });
    });
}
