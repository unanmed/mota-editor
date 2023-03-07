import { ProjectHandler } from './project';

declare global {
    interface Window {
        editor: {
            project: ProjectHandler;
        };
    }
}
