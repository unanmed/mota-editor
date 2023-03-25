import {
    CodeFile,
    getFormatedString,
    codeList
} from '../../../panel/view/components/code/code';
import {
    selectionList,
    Selection
} from '../../../panel/view/components/select/select';
import {
    checkboxList,
    TableElement,
    textList
} from '../../../panel/view/components/table/element';
import { getTableObject } from '../../../panel/view/components/table/table';
import { Project, watchFolders } from '../project';

// 500ms debounce
const timeoutMap: Record<string, number> = {};
export function emitFileChange(path: string, project: Project) {
    const folder = path
        .replace(/(\/|\\)+/g, '/')
        .split('/')
        .slice(0, -1)
        .join('/');

    const uri = watchFolders[folder];
    if (!uri) return;
    if (timeoutMap[folder]) clearTimeout(timeoutMap[path]);
    timeoutMap[folder] = window.setTimeout(() => {
        project.emit('fileChange', path, uri);
    }, 500);
}

export function updateMainData(data: DataCore) {
    const checkCode = (list: CodeFile[]) => {
        list.forEach(v => {
            if (!v.saved.value || !v.canWatch) return;
            if (v.uri.scheme !== 'data') return;
            const content = getTableObject(v.uri, { data });
            const text = getFormatedString(
                content.content,
                content.info.type as 'json' | 'code' | 'text' | 'number'
            );
            v.update(text);
        });
    };

    const checkSelect = async (list: Selection[]) => {
        await Promise.all(
            list.map(v => {
                if (!v.canWatch) return;
                if (v.uri.scheme !== 'data') return;

                return (async () => {
                    const content = getTableObject<string[]>(v.uri, { data });
                    if (content.info.target === 'file') await v.parseFile();
                    v.updateSelected(content.content);
                })();
            })
        );
    };

    const checkTableElement = (...list: TableElement[][]) => {
        list.forEach(v => {
            v.map(v => {
                if (!v.canWatch) return;
                if (v.uri.scheme !== 'data') return;

                const content = getTableObject<boolean>(v.uri, { data });
                v.update(content.content);
            });
        });
    };

    codeList.forEach(v => checkCode(v.list));
    selectionList.forEach(v => checkSelect(v.list));
    checkTableElement(checkboxList, textList);
}
