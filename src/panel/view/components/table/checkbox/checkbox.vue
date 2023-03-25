<template>
    <a-checkbox :checked="checkbox.value.value" @change="change"></a-checkbox>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { spliceElement } from '../../../../../editor/utils/utils';
import { TableElement, checkboxList } from '../element';

const props = defineProps<{
    checkbox: TableElement<boolean>;
}>();

function change() {
    props.checkbox.value.value = !props.checkbox.value.value;
    props.checkbox.save();
}

onUnmounted(() => {
    spliceElement(checkboxList, props.checkbox);
});
</script>

<style lang="less" scoped></style>
