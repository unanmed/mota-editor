<template>
    <a-input
        class="input"
        spellcheck="false"
        v-model:value="text.value.value"
        @change="change"
        @dblclick="onDoubleClick"
    ></a-input>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { spliceElement } from '../../../../../editor/utils/utils';
import { TableElement, textList } from '../element';
import { TableProps } from '../table';
import { buttonEdit } from '../tableEdit';

const props = defineProps<{
    props: TableProps;
    text: TableElement<string>;
}>();

function change() {
    props.text.save();
}

function onDoubleClick() {
    buttonEdit(props.props, props.text.uri, props.text.value.value);
}

onUnmounted(() => {
    spliceElement(textList, props.text);
});
</script>

<style lang="less" scoped>
.input {
    font-size: 16px;
    margin: 0 15px;
}
</style>
