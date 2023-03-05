import { dialog, ipcMain } from 'electron';

export class ProjectSelector {
    /**
     * 选择一个h5魔塔项目
     */
    select() {}

    /**
     * 打开若干个魔塔项目
     * @param paths 项目数组
     */
    openAll(paths: string) {}

    /**
     * 打开一个项目目录
     * @param path 项目目录
     */
    open(path: string) {}

    /**
     * 测试一个项目目录是否合法
     * @param path 项目目录
     */
    test(path: string) {}

    /**
     * 从一个文件夹打开项目，如果不存在project.h5proj文件，则会自动创建
     * @param path 文件夹路径
     */
    selectFromFolder(path: string) {}
}

export function injectProjectSelector() {
    const selector = new ProjectSelector();
    ipcMain.handle('project.select', () => selector.select());
    ipcMain.handle('project.open', (e, path) => selector.open(path));
    ipcMain.handle('project.selectFolder', (e, path) =>
        selector.selectFromFolder(path)
    );
}
