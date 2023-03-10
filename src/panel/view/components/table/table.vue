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
                :root="root"
                :path="path"
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
    root: string;
    path: string;
}>();

const opened = ref(true);

const toRender = props.data.data as Record<string, TableElement>;
</script>

<style lang="less" scoped></style>
