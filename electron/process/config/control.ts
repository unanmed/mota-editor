import { app } from 'electron';
import { ensureFile } from 'fs-extra';
import { resolve } from 'path';
import fs from 'fs/promises';

export class ConfigController<T> {
    path: string;
    data!: T;

    static list: ConfigController<any>[] = [];

    private readyPromise: Promise<void>;

    constructor(file: string, defaultValue?: T) {
        const usr = app.getPath('userData');
        this.path = resolve(usr, file);
        this.readyPromise = new Promise(async res => {
            await ensureFile(this.path);
            let str = await fs.readFile(this.path, 'utf-8');
            if (str.length === 0) str = `{}`;
            try {
                this.data = JSON.parse(str);
            } catch {
                this.data = defaultValue!;
            }
        });
        ConfigController.list.push(this);
    }

    /**
     * 当控制器准备完毕时
     */
    whenReady() {
        return this.readyPromise;
    }

    /**
     * 写入
     * @param data 内容
     */
    write(data: T) {
        this.data = data;
    }

    /**
     * 写入文件
     */
    async writeToFile() {
        await fs.writeFile(this.path, JSON.stringify(this.data));
    }
}

export async function writeAllConfigFiles() {
    await Promise.all(ConfigController.list.map(v => v.writeToFile()));
}
