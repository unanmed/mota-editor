<template>
    <a-checkbox :checked="checkbox.checked.value" @change="change"></a-checkbox>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { checkboxList, TableCheckbox } from './checkbox';
import { spliceElement } from '../../../../../editor/utils/utils';

const props = defineProps<{
    checkbox: TableCheckbox;
}>();

function change() {
    props.checkbox.checked.value = !props.checkbox.checked.value;
    props.checkbox.save();
}

onUnmounted(() => {
    spliceElement(checkboxList, props.checkbox);
});
</script>

<style lang="less" scoped></style>
