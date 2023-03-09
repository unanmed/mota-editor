<template>
    <div class="table-root">
        <div
            class="table-folder"
            @click="() => (opened = !opened)"
            :style="{
                backgroundColor: `#${(3 + props.n).toString().repeat(3)}`
            }"
        >
            <RightOutlined
                class="table-fold-icon"
                :style="{
                    transition: `transform 0.3s ease`,
                    transform: opened ? `rotate(90deg)` : `none`
                }"
            />
            <span class="table-fold-key">{{ data.text }}</span>
        </div>
        <div v-if="opened" class="table-content">
            <TableRenderer
                v-for="(data, key) of toRender"
                :keys="key"
                :data="data"
                :n="n + 1"
            ></TableRenderer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableElement, TableRenderer } from './table';
import { RightOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    keys: string;
    data: TableElement;
    n: number;
}>();

const opened = ref(true);

const toRender: Record<string, TableElement> = {};
for (const [key, d] of Object.entries(props.data)) {
    if (typeof d !== 'string') toRender[key] = d;
}
</script>

<style lang="less" scoped></style>
