<template>
    <Multi :controller="code" @resize="editor.layout()">
        <template #left>
            <div class="code-list unique-scroll">
                <div
                    class="code-list-one"
                    :selected="i === selected"
                    v-for="(file, i) of code.list"
                    @click="code.select(i, editor.saveViewState())"
                >
                    <span class="file-name">
                        <svg
                            v-if="!file.saved.value"
                            class="file-unsaved"
                            fill="white"
                        >
                            <ellipse cx="8" cy="8" rx="6" ry="6"></ellipse>
                        </svg>
                        <span>{{ file.name }}</span>
                    </span>
                    <CloseOutlined
                        class="file-close"
                        @click.stop="code.remove(i, editor.saveViewState())"
                    />
                </div>
            </div>
        </template>
        <template #right>
            <div class="code-main" :id="`code-main-${code.num}`"></div>
            <span v-if="!show" class="code-empty">Code Editor</span>
        </template>
    </Multi>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { CodeController } from './code';
import * as monaco from 'monaco-editor';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { CloseOutlined } from '@ant-design/icons-vue';
import Multi from '../multi/multi.vue';

const props = defineProps<{
    code: CodeController;
    panelNum: number;
}>();

let codeMain: HTMLDivElement;
let codePanel: HTMLDivElement;
let editor: monaco.editor.IStandaloneCodeEditor;

let mutation: MutationObserver;

const selected = props.code.selected;

const show = computed(() => props.code.list.length > 0);
const file = computed(() => props.code.list[selected.value]);

function changeFile(index: number) {
    const file = props.code.list[index];
    if (!file) return;
    editor.setModel(file.model);
    editor.restoreViewState(file.view ?? null);
}

/**
 * 创建编辑器
 */
async function create() {
    editor = monaco.editor.create(codeMain, {
        theme: 'dark-plus',
        fontSize: 20,
        fontFamily: 'code, 微软雅黑',
        fontLigatures: true
    });

    watchEffect(() => changeFile(selected.value));

    const loadTM = async (path: string) => {
        return JSON.parse(await window.editor.extra.get(path, 'utf-8'));
    };

    const grammars = new Map([
        ['javascript', 'source.js'],
        ['typescript', 'source.ts'],
        ['css', 'source.css'],
        ['html', 'text.html.basic'],
        ['json', 'source.json']
    ]);
    const grammarFiles = new Map<string, any>([
        ['source.js', await loadTM('code/js.tm.json')],
        ['source.ts', await loadTM('code/ts.tm.json')],
        ['source.css', await loadTM('code/css.tm.json')],
        ['text.html.basic', await loadTM('code/html.tm.json')],
        ['source.json', await loadTM('code/json.tm.json')]
    ]);

    const registry = new Registry({
        getGrammarDefinition: async scopeName => {
            return {
                format: 'json',
                content: grammarFiles.get(scopeName)
            };
        }
    });

    setTimeout(() => {
        wireTmGrammars(monaco, registry, grammars, editor);
    }, 250);

    editor.focus();
    editor.setModel(props.code.list[selected.value]?.model);

    listen();
}

function listen() {
    editor.onDidChangeModelContent(e => {
        file.value.saved.value = false;
    });

    editor.onKeyDown(e => {
        if (e.ctrlKey && e.keyCode === monaco.KeyCode.KeyS) {
            file.value.save();
        }
    });
}

/**
 * 当窗口大小变化时，执行编辑器的resize
 */
function resize() {
    mutation = new MutationObserver((list, observer) => {
        editor.layout();
    });

    mutation.observe(codePanel, {
        attributes: true,
        attributeFilter: ['style']
    });
}

onMounted(async () => {
    codeMain = document.getElementById(
        `code-main-${props.code.num}`
    ) as HTMLDivElement;

    codePanel = document.getElementById(
        `panel-one-${props.panelNum}`
    ) as HTMLDivElement;

    const darkTheme = JSON.parse(
        await window.editor.extra.get('code/dark.theme.json', 'utf-8')
    );

    monaco.editor.defineTheme('dark-plus', darkTheme);

    requestAnimationFrame(create);

    resize();

    props.code.added = true;
});

onUnmounted(() => {
    mutation.disconnect();
    props.code.added = false;
    props.code.list.splice(0);
});
</script>

<style lang="less" scoped>
.code-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 8px 2px;
}

.code-main,
.code-empty {
    width: 100%;
    height: 100%;
    background-color: #222;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 32px;
    left: -1px;
}

.code-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    font-size: 32px;
}

.code-list-one {
    font-size: 16px;
    margin: 2px 5px;
    padding: 2px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.1s linear;
}

.code-list-one:hover,
.code-list-one[selected='true'] {
    border-radius: 5px;
    background-color: #444;
}

.file-name {
    display: flex;
    align-items: center;
}

.file-unsaved {
    width: 16px;
    height: 16px;
    color: white;
    margin-right: 12px;
}

.file-close {
    padding: 2px;
    border-radius: 3px;
    transition: background-color 0.1s linear;
}

.file-close:hover {
    background-color: #888;
}
</style>
