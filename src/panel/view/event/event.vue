<template></template>

<script lang="ts" setup>
import { getEventById, getEventByType } from './loader';

const props = defineProps<{
    event: any;
    entry?: string;
}>();

const entry = props.entry ?? 'entry-default';
const entryInfo = getEventByType(entry) ?? getEventById(entry);

if (!entryInfo) {
    throw new TypeError(
        `Cannot resolve event, since entry cannot be resolved.` +
            `Entry type: '${entry}'`
    );
}

function initEvent() {}
</script>

<style lang="less" scoped></style>
