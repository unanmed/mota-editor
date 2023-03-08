import { MotaProjectData } from '../../../electron/process/editor/project/project';

export class Project {
    constructor(data: MotaProjectData) {}

    close() {}
}

interface ProjectInfo {
    project?: Project;
}

export const projectInfo: ProjectInfo = {};
