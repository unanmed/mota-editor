<template>
    <div class="code-root" :id="`code-root-${code.num}`">
        <div class="code-left" :style="{ width: `${leftWidth}px` }">
            <div class="code-list unique-scroll"></div>
        </div>
        <div class="splitter"></div>
        <div
            class="code-right"
            :id="`code-right-${code.num}`"
            :style="{
                width: `calc(100% - ${leftWidth + 2}px)`
            }"
        >
            <div class="code-main" :id="`code-main-${code.num}`"></div>
            <span v-if="!show" class="code-empty">Code Editor</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { CodeProps } from './code';
import * as monaco from 'monaco-editor';
import { loadWASM } from 'onigasm';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';

let codeMain: HTMLDivElement;
let codeRight: HTMLDivElement;
let codePanel: HTMLDivElement;
let editor: monaco.editor.IStandaloneCodeEditor;

let mutation: MutationObserver;

const selected = ref(0);

const leftWidth = ref(200);
const leftMax = 300;
const leftMin = 100;

const props = defineProps<{
    code: CodeProps;
    panelNum: number;
}>();

const show = computed(() => props.code.fileList.length > 0);

/**
 * 创建编辑器
 */
async function create() {
    editor = monaco.editor.create(codeMain, {
        theme: 'dark-plus',
        fontSize: 20,
        fontFamily: 'code',
        fontLigatures: true,
        language: 'javascript'
    });
    const wasm = await window.editor.extra.get('code/onigasm.wasm');
    const ab = new ArrayBuffer(wasm.length);
    const view = new Uint8Array(ab);
    wasm.forEach((v, i) => (view[i] = v));

    await loadWASM(ab);

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

    await wireTmGrammars(monaco, registry, grammars, editor);

    editor.focus();
}

function resize() {
    mutation = new MutationObserver((list, observer) => {});

    mutation.observe(codeRight, {
        attributes: true,
        attributeFilter: ['style']
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
    codeRight = document.getElementById(
        `code-right-${props.code.num}`
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
});

onUnmounted(() => {
    mutation.disconnect();
});
</script>

<style lang="less" scoped>
.code-root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;
}

.code-list {
    display: flex;
    width: 100%;
    overflow: hidden scroll;
    height: 100%;
}

.code-main,
.code-empty {
    width: 100%;
    height: 100%;
    background-color: #222;
}

.code-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
}

.splitter {
    height: 100%;
    width: 2px;
    background-color: #fff;
    cursor: ew-resize;
    z-index: 1;
    transition: transform 0.2s ease;
}

.splitter:hover,
.splitter:active {
    transform: scaleX(300%);
}

.code-left {
    max-width: 300px;
    min-width: 100px;
    width: 200px;
}

.code-right {
    width: calc(100% - 202px);
}
</style>
