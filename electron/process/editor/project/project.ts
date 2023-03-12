import { resolve } from 'path';
import { includesAll } from '../../../utils/extend';
import fs from 'fs/promises';
import { first } from '../../config/firstConfig';

export interface FileData {
    name: string;
    content: any;
}

export type MotaMainInfo =
    | 'data'
    | 'enemys'
    | 'events'
    | 'functions'
    | 'icons'
    | 'items'
    | 'maps'
    | 'plugins';

export type MotaMaterialList =
    | 'animates'
    | 'enemy48'
    | 'enemys'
    | 'icons'
    | 'items'
    | 'npc48'
    | 'npcs'
    | 'terrains';

export interface Directory {
    folder: boolean;
    name: string;
}

export type Structure = {
    [key: string]: Directory | Structure;
};

export interface MotaProjectData {
    floors: FileData[];
    images: FileData[];
    bgms: FileData[];
    sounds: FileData[];
    animates: FileData[];
    tilesets: FileData[];
    autotiles: FileData[];
    mainInfo: FileData[];
    material: FileData[];
    libs: FileData[];
    main: FileData;
    index: FileData;
    style: FileData;
    structure: Structure;
    path: string;
    extensions: FileData[];
    readonly?: boolean;
}

export const projectList: MotaProject[] = [];

export class MotaProject {
    /** 项目路径 */
    dir!: string;
    /** 项目名称 */
    name!: string;
    /** 项目信息 */
    info: any;
    /** 当前目录是否合法 */
    valid: boolean = true;

    data!: MotaProjectData;

    private testPromise: Promise<void>;

    constructor(path: string) {
        this.dir = path;
        this.testPromise = new Promise(res => {
            (async () => {
                if (!(await this.test())) {
                    this.valid = false;
                } else {
                    this.info = await this.getProjectInfo();
                    this.name = this.info.name;
                }
                res();
            })();
        });
    }

    /**
     * 当项目准备完毕后
     */
    async whenReady() {
        return this.testPromise;
    }

    /**
     * 打开一个项目目录
     * @param path 项目目录
     */
    async open(): Promise<string | MotaProjectData> {
        if (!this.valid) {
            return '不合法的目录结构，请在资源管理器中修改或新建一个项目';
        }

        // 素材等
        const floors = await this.readDirContent(
            resolve(this.dir, 'project/floors'),
            await fs.readdir(resolve(this.dir, 'project/floors')),
            'utf-8'
        );
        const [images, bgms, sounds, animates, tilesets, autotiles] =
            await Promise.all(
                [
                    'images',
                    'bgms',
                    'sounds',
                    'animates',
                    'tilesets',
                    'autotiles'
                ].map(v => {
                    return this.readDirContent(
                        resolve(this.dir, `project/${v}`)
                    );
                })
            );

        const libList = await fs.readdir(resolve(this.dir, 'libs'));
        const toRead: string[] = [];
        for await (const lib of libList) {
            const stat = await fs.stat(resolve(this.dir, 'libs', lib));
            if (stat.isFile()) toRead.push(lib);
        }

        // 核心js代码
        const libs = await this.readDirContent(
            resolve(this.dir, 'libs'),
            toRead,
            'utf-8'
        );

        // 拓展插件
        const exList = await fs.readdir(resolve(this.dir, 'extensions'));
        const ex: string[] = [];
        for await (const one of exList) {
            const stat = await fs.stat(resolve(this.dir, 'extensions', one));
            if (stat.isFile()) ex.push(one);
        }

        const extensions = await this.readDirContent(
            resolve(this.dir, 'extensions'),
            ex,
            'utf-8'
        );

        // 根目录的三个重要文件
        const main = await this.readFile(this.dir, 'main.js', 'utf-8');
        const index = await this.readFile(this.dir, 'index.html', 'utf-8');
        const style = await this.readFile(this.dir, 'styles.css', 'utf-8');

        // 配置文件
        const mainInfo = await this.readDirContent(
            resolve(this.dir, 'project'),
            [
                'data.js',
                'enemys.js',
                'events.js',
                'functions.js',
                'icons.js',
                'items.js',
                'maps.js',
                'plugins.js'
            ],
            'utf-8'
        );
        // 素材文件
        const material = await this.readDirContent(
            resolve(this.dir, 'project/materials'),
            [
                'animates.png',
                'enemy48.png',
                'enemys.png',
                'icons.png',
                'items.png',
                'npc48.png',
                'npcs.png',
                'terrains.png'
            ]
        );

        const root = await fs.readdir(this.dir);
        const structure: Record<string, Directory> = {};
        for await (const v of root) {
            if (v === '.git') continue;

            structure[v] = {
                name: v,
                folder: !(await fs.stat(resolve(this.dir, v))).isFile()
            };
        }

        const project: MotaProjectData = {
            floors,
            images,
            bgms,
            sounds,
            animates,
            tilesets,
            autotiles,
            main,
            index,
            style,
            mainInfo,
            material,
            libs,
            structure,
            path: this.dir,
            extensions,
            readonly: false
        };

        console.log(`open project ${this.name} success.`);
        projectList.push(this);
        const config = first.data!;
        config.recent ??= [];
        if (config.recent.length > 10) {
            config.recent.pop();
        }
        if (config.recent.includes(this.dir)) {
            config.recent = config.recent.filter(v => v !== this.dir);
        }
        config.recent.unshift(this.dir);

        this.data = project;

        await first.writeToFile();

        return project;
    }

    /**
     * 测试一个项目目录是否合法
     * @param path 项目目录
     */
    async test() {
        try {
            const libs = await fs.readdir(resolve(this.dir, 'libs'));
            if (libs.length === 0) return false;

            const project = await fs.readdir(resolve(this.dir, 'project'));
            if (project.length === 0) return false;

            if (!includesAll(project, ['data.js', 'icons.js', 'floors'])) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    /**
     * 关闭这个项目
     */
    async close() {}

    /**
     * 获取项目信息
     */
    async getProjectInfo() {
        try {
            const proj = await fs.readFile(
                resolve(this.dir, 'project.h5proj'),
                'utf-8'
            );
            return JSON.parse(proj);
        } catch {
            const name = this.dir.split(/(\/|\\)/).at(-1);
            await fs.writeFile(
                resolve(this.dir, 'project.h5proj'),
                JSON.stringify({ name }),
                'utf-8'
            );
            return { name };
        }
    }

    async save(info: string, content: string) {
        if (info === 'data') {
            await fs.writeFile(`${this.dir}/project/data.js`, content, 'utf-8');
        }
    }

    /**
     * 测试是否存在路径，不存在则创建
     * @param path 路径
     */
    private async testDir(path: string): Promise<string[]> {
        try {
            if (!/(\/|\\)/.test(path)) throw 0;
            const res = await fs.readdir(path);
            return res;
        } catch (e) {
            if (e === 0) {
                throw new Error(`Cannot resolve mota project.`);
            }

            try {
                await this.testDir(
                    resolve(...path.split(/(\/|\\)/).slice(0, -1))
                );
                return [];
            } catch {
                throw new Error(`Cannot resolve mota project.`);
            }
        }
    }

    /**
     * 读取一个路径下的所有文件的内容
     * @param path 路径
     * @param list 文件列表
     * @param encoding 编码方式
     */
    private async readDirContent(
        path: string,
        list?: string[],
        encoding?: BufferEncoding
    ) {
        list ??= await this.testDir(path);
        return Promise.all<FileData>(
            list.map(async v => {
                return {
                    name: v,
                    content: await fs.readFile(resolve(path, v), encoding)
                };
            })
        );
    }

    /**
     * 读取一个文件
     * @param path 路径
     * @param file 文件名
     * @param encoding 编码方式
     */
    private async readFile(
        path: string,
        file: string,
        encoding?: BufferEncoding
    ) {
        return {
            name: file,
            content: await fs.readFile(resolve(path, file), encoding)
        };
    }

    private doWatch() {
        // 全塔属性
    }
}
