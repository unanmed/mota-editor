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
            <span v-if="!!useSlot" class="table-fold-key">
                <slot name="name"></slot>
            </span>
            <template v-else>
                <span class="table-fold-key">{{ data!.text }}</span>
            </template>
        </div>
        <template v-if="!!memo">
            <div v-show="opened" class="table-content">
                <template v-if="!!useSlot">
                    <slot></slot>
                </template>
                <template v-else>
                    <TableRenderer
                        v-for="(data, key) of toRender"
                        :keys="key"
                        :data="(data as TableElement)"
                        :n="n + 1"
                        :root="root!"
                        :path="path!"
                    ></TableRenderer>
                </template>
            </div>
        </template>
        <template v-else>
            <div v-if="opened" class="table-content">
                <template v-if="!!useSlot">
                    <slot></slot>
                </template>
                <template v-else>
                    <TableRenderer
                        v-for="(data, key) of toRender"
                        :keys="key"
                        :data="(data as TableElement)"
                        :n="n + 1"
                        :root="root!"
                        :path="path!"
                    ></TableRenderer>
                </template>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableElement, TableRenderer } from './table';
import { RightOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    useSlot?: boolean;
    keys?: string;
    data?: TableElement;
    n: number;
    root?: string;
    path?: string;
    opened?: boolean;
    memo?: boolean;
}>();

const opened = ref(!!props.opened);

const toRender =
    !props.useSlot && (props.data!.data as Record<string, TableElement>);
</script>

<style lang="less" scoped></style>
