import { MotaProject } from '../project/project';
import ws from 'ws';

export class MotaSocketServer {
    port: number = 8080;
    server?: ws.WebSocketServer;
    root: string;
    project: MotaProject;

    constructor(base: string, project: MotaProject) {
        this.root = base;
        this.project = project;
    }

    async start() {
        console.log(Object.keys(ws));

        const wss = new ws.WebSocketServer({ noServer: true });

        wss.on('connection', () => {
            console.log(1);
        });
    }
}
