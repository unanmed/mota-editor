import { Button } from 'ant-design-vue';
import { Uri } from 'monaco-editor';
import { projectInfo } from '../../../../editor/project/project';
import { saveByScheme, saveData } from '../../../../editor/project/save';
import { view } from '../../../../editor/view/control';
import { addCode, addSelection, showCode, showSelection } from '../../control';
import { codeList, createCodeFile, CodeController } from '../code/code';
import { MultiItem } from '../multi/multi';
import {
    selectionList,
    SelectInfo,
    SelectionController,
    Select,
    Selection
} from '../select/select';
import { getTableObject, TableElement, TableProps, TableType } from './table';
import { checkboxList, TableElement as Element, textList } from './element';
import Checkbox from './components/checkbox.vue';
import Text from './components/text.vue';

export function Edit(props: TableProps) {
    const uri = new Uri().with({
        path: `${props.path}${props.path ? '.' : ''}${props.keys}`,
        scheme: props.root
    });
    const content = getTableObject(uri);
    const type = props.data.type;
    if (type === 'checkbox') {
        const checkbox = new Element(uri, checkboxList);
        onTableSave(checkbox, 'checkbox');
        return <Checkbox checkbox={checkbox}></Checkbox>;
    } else if (type === 'text' || type === 'number') {
        const text = new Element(uri, textList);
        onTableSave(text, type);
        return <Text props={props} text={text}></Text>;
    } else {
        return (
            <Button
                onClick={() => buttonEdit(props, uri, content)}
                style="font-size: 16px"
            >
                编辑
            </Button>
        );
    }
}

export function buttonEdit(props: TableProps, uri: Uri, content: any) {
    const data = props.data;
    const type = data.type;

    if (
        type === 'code' ||
        type === 'text' ||
        type === 'json' ||
        type === 'number'
    ) {
        const lang = type === 'code' || type === 'number' ? 'javascript' : type;
        const editor = codeList[0] ?? addCode();
        if (!editor) return;

        const content = getTableValue(uri, data.type);
        const file = createCodeFile(data.text, content, lang, uri);
        editor.add(file);
        onTableSave(file, data.type);

        if (!editor.added) tryShowCode(editor);
    } else if (type === 'select') {
        const select = selectionList[0] ?? addSelection();
        if (!select) return;
        const selection = new Selection(
            content.info as SelectInfo,
            content.content,
            projectInfo.project!.data.path,
            uri
        );

        select.add(selection);
        onTableSave(selection, 'select');

        if (!select.added) tryShowSelection(select);
    }
}

function getTableValue(uri: Uri, type: TableElement['type'] = 'code') {
    const { content } = getTableObject(uri);
    if (type === 'json' || type === 'number') {
        return JSON.stringify(content, void 0, 4);
    } else return content;
}

function onTableSave(file: MultiItem, type: TableElement['type'] = 'code') {
    const { root, lastKey: key, info } = getTableObject(file.uri);
    file.on('save', async (content: any) => {
        const regexp = info.regexp;
        const data = getParsedData(content, type, file);
        if (regexp) {
            if (!new RegExp(regexp).test(data)) return false;
        }
        // 对表格数据赋值
        root[key] = data;

        const scheme = file.uri.scheme;
        // 保存至本地文件
        saveByScheme(scheme);
        return true;
    });
}

function getParsedData(data: any, type: TableType, item: MultiItem) {
    if (type === 'json' || type === 'number') {
        return JSON.parse(data);
    } else if (type === 'select') {
        if ((item as Selection).type === 'multi') {
            return (data as Select[]).filter(v => v.selected).map(v => v.text);
        } else {
            return (data as Select[]).find(v => v.selected)?.text;
        }
    } else {
        return data;
    }
}

function tryShowCode(editor: CodeController) {
    const panel = view.list.find(v => v.type === 'code');
    panel?.close();
    showCode(editor);
}

function tryShowSelection(selection: SelectionController) {
    const panel = view.list.find(v => v.type === 'select');
    panel?.close();
    showSelection(selection);
}
