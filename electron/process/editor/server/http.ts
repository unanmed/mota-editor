import http from 'http';
import { cleanUrl } from '../../../utils/extend';
import { MotaProject, MotaProjectData } from '../project/project';

export class MotaHttpServer {
    port: number = 3000;
    host: string = '127.0.0.1';
    https: boolean = false;
    root: string;
    project: MotaProject;

    server?: http.Server;
    handler?: HttpHandler;

    constructor(base: string, project: MotaProject) {
        this.root = base;
        this.project = project;
    }

    async start(port: number = 3000) {
        const server = new http.Server();
        await new Promise((res, rej) => {
            const onError = (e: Error & { code?: string }) => {
                if (e.code === 'EADDRINUSE') {
                    console.log(
                        `Port ${port} is in use, trying another one...`
                    );
                    server.listen(++port, this.host);
                } else {
                    server.removeListener('error', onError);
                    rej(e);
                }
            };

            server.on('error', onError);

            server.listen(port, this.host, () => {
                server.removeListener('error', onError);
                res(port);
                this.port = port;
            });
        });
        console.log(`已开启服务：http://${this.host}:${port}`);
        this.server = server;
        this.handler = new HttpHandler(this);
    }

    async stop() {
        this.server?.close();
    }
}

type Request = http.IncomingMessage;
type Response = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
};

export class HttpHandler {
    server: http.Server;
    root: string;
    http: MotaHttpServer;
    name: string;

    constructor(server: MotaHttpServer) {
        this.name = server.project.mainData.firstData.name;
        this.http = server;
        this.server = server.server!;
        this.root = server.root;
        this.server.on('request', this.handleRequest);
    }

    async handleRequest(req: Request, res: Response) {
        const type = req.method;
        if (type !== 'GET' && type !== 'POST') {
            res.statusCode = 404;
            res.end();
            return;
        }
        if (type === 'GET') {
            return this.get(req, res);
        } else {
            return this.post(req, res);
        }
    }

    normalize(url: string) {
        return cleanUrl(
            url.replace(`/games/${this.name}/`, '/').replace('/all/', '/')
        );
    }

    private async get(req: Request, res: Response) {}

    private async post(req: Request, res: Response) {}
}
