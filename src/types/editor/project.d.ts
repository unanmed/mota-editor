import { MotaProjectData } from '../../../electron/process/editor/project/project';

interface ProjectHandler {
    /**
     * 选择魔塔项目
     */
    select(): void;

    /**
     * 打开魔塔项目
     */
    open(path: string): Promise<MotaProjectData>;

    /**
     * 从文件夹打开魔塔项目
     * @param path 路径
     */
    selectFolder(path: string): Promise<MotaProjectData>;

    /**
     * 关闭一个魔塔项目
     * @param path 路径
     */
    close(path: string): void;

    /**
     * 获取最近的项目
     */
    getRecent(): Promise<string[]>;
}
