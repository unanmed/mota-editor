import { projectInfo } from './project';

export async function saveData() {
    const content = JSON.stringify(projectInfo.project!.mainData, void 0, 4);

    await window.editor.file.write(
        `${projectInfo.project!.data.path}/project/data.js`,
        `var data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d = \r\n${content}`,
        'utf-8'
    );
}

export async function saveByScheme(scheme: string) {
    if (scheme === 'data') return saveData();
}
