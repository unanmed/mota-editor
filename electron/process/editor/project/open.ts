import { dialog, ipcMain } from 'electron';
import { resolve, dirname } from 'path';
import { MotaProject, projectList } from './project';

export class ProjectSelector {
    /**
     * 选择一个h5魔塔项目
     */
    async select() {
        const res = await dialog.showOpenDialog({
            title: '请选择魔塔项目文件',
            filters: [
                { name: 'project', extensions: ['h5proj'] },
                { name: 'all', extensions: ['*'] }
            ]
        });
        return await this.open(res.filePaths[0]);
    }

    /**
     * 打开若干个魔塔项目
     * @param paths 项目数组
     */
    async openAll(paths: string[]) {
        const res = await Promise.all(paths.map(v => this.open(v)));
        return res;
    }

    /**
     * 打开一个项目
     * @param path 项目路径
     */
    async open(path: string) {
        const project = new MotaProject(dirname(path));
        return await project.whenReady().then(() => project.open());
    }

    /**
     * 从一个文件夹打开项目，如果不存在project.h5proj文件，则会自动创建
     * @param path 文件夹路径
     */
    async selectFromFolder(path: string) {
        return await this.open(resolve(path, 'project.h5proj'));
    }

    /**
     * 选择项目文件夹
     */
    async selectFolder() {
        const res = await dialog.showOpenDialog({
            title: '请选择魔塔项目文件夹',
            properties: ['openDirectory']
        });
        return await this.selectFromFolder(res.filePaths[0]);
    }
}

export function injectProjectSelector() {
    const selector = new ProjectSelector();
    ipcMain.handle('project.select', () => selector.select());
    ipcMain.handle('project.open', (e, path) => selector.open(path));
    ipcMain.handle('project.selectFolder', e => selector.selectFolder());
    ipcMain.handle('project.close', (e, path) =>
        projectList.find(v => v.dir === path)?.close()
    );
}
