<template>
    <div class="input" :id="`table-input-${str}`">
        <a-input
            v-if="type === 'text'"
            spellcheck="false"
            v-model:value="text.value.value"
            @change="change"
            @dblclick="onDoubleClick"
        ></a-input>
        <a-input-number
            v-if="type === 'number'"
            :controls="false"
            v-model:value="text.value.value"
            @change="change"
            @dblclick="onDoubleClick"
        ></a-input-number>
        <a-button class="button" v-if="showEdit" @click="onDoubleClick"
            >编辑</a-button
        >
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { spliceElement } from '../../../../../editor/utils/utils';
import { codeList } from '../../code/code';
import { TableElement, textList } from '../element';
import { TableProps } from '../table';
import { buttonEdit } from '../tableEdit';

let input: HTMLDivElement;
let observer: ResizeObserver;

let showEdit = ref(false);

const props = defineProps<{
    props: TableProps;
    text: TableElement<string>;
}>();

const type = props.props.data.type;

const str = props.text.uri.toString();

const edit = type === 'text' ? 280 : 200;

function change() {
    props.text.save();
    updateCode();
}

function onDoubleClick() {
    buttonEdit(props.props, props.text.uri, props.text.value.value);
}

function listen() {
    observer = new ResizeObserver(onChange);

    observer.observe(input);
}

function onChange(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
        if (entry.contentRect.width > edit - props.props.n * 13) {
            showEdit.value = true;
        } else showEdit.value = false;
    }
}

function updateCode() {
    for (const code of codeList) {
        const c = code.indexOf(props.text.uri);
        if (c === -1) continue;
        const file = code.list[c];
        file.update(
            type === 'text'
                ? props.text.value.value
                : JSON.stringify(props.text.value.value)
        );
    }
}

onMounted(() => {
    input = document.getElementById(`table-input-${str}`) as HTMLDivElement;

    listen();
});

onUnmounted(() => {
    spliceElement(textList, props.text);
});
</script>

<style lang="less" scoped>
.input {
    :deep(.ant-input-number-input),
    :deep(.ant-input) {
        font-size: 16px;
    }

    :deep(.ant-input-number) {
        width: 100%;
    }

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding: 0 24px;
    width: 100%;
    max-width: 500px;
}

.button {
    font-size: 16px;
    margin-left: 24px;
}
</style>
