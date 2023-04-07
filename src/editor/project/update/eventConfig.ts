import { Uri } from 'monaco-editor';
import { WebSocketMessageData } from '../socket';
import {
    configs,
    parseConfig
} from '../../../panel/view/components/event/config/config';
import { codeList } from '../../../panel/view/components/code/code';

export function onEventConfigChange(
    file: WebSocketMessageData['change' | 'add' | 'remove']
) {
    if (!/^_editor(\/|\\)event/.test(file.file)) return;

    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: file.file.replaceAll('\\', '/')
    });

    configs.forEach(v => {
        const i = v.indexOf(uri);
        if (file.type === 'add') {
            const config = parseConfig(
                file.file.split(/\/|\//).at(-1)!,
                file.content.data as string
            );
            if (!config) return;
            v.add(config);
        } else {
            if (i === -1) return;
            if (file.type === 'remove') {
                v.remove(i);
                return;
            }
            if (file.type === 'change') {
                if (v.list[i].canWatch) {
                    v.list[i].update(file.content.data as string);
                }
            }
        }
    });
    codeList.forEach(v => {
        for (let i = 0; i < v.list.length; i++) {
            const code = v.list[i];
            if (code.uri.scheme === 'eventConfig') {
                v.remove(i);
                i--;
            }
        }
    });
}
