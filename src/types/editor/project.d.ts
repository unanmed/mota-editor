import {
    MotaProjectData,
    ProjectInfo
} from '../../../electron/process/editor/project/project';

interface ProjectHandler {
    /**
     * 选择魔塔项目
     */
    select(): Promise<MotaProjectData | string>;

    /**
     * 打开魔塔项目
     */
    open(path: string): Promise<MotaProjectData | string>;

    /**
     * 从文件夹打开魔塔项目
     * @param path 路径
     */
    selectFolder(path: string): Promise<MotaProjectData | string>;

    /**
     * 关闭一个魔塔项目
     * @param path 路径
     */
    close(path: string): Promise<void>;

    /**
     * 获取最近的项目
     */
    getRecent(): Promise<string[]>;

    /**
     * 向主进程发送当前窗口的项目信息
     */
    sendProjectInfo(path: string): Promise<void>;

    setInfo(info: ProjectInfo): Promise<void>;
}
