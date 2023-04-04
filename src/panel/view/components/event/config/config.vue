<template>
    <Multi :controller="config">
        <template #left>
            <div class="config-list unique-scroll">
                <div
                    class="config-list-one"
                    v-for="(item, i) in config.list"
                    :selected="i === selected"
                    @click="config.select(i)"
                >
                    <span class="file-name">
                        <span>{{ item.name }}</span>
                    </span>
                    <DeleteOutlined class="config-delete" />
                </div>
            </div>
        </template>
        <template #right>
            <Block
                v-if="item?.type === 'eventBlock'"
                :block="(item as EventBlockConfig)"
            ></Block>
        </template>
    </Multi>
</template>

<script lang="ts" setup>
import Multi from '../../multi/multi.vue';
import { EventConfigController } from './config';
import { DeleteOutlined } from '@ant-design/icons-vue';
import Block from './block.vue';
import { computed, onUnmounted } from 'vue';
import { EventBlockConfig } from '../../../event/config';

const props = defineProps<{
    config: EventConfigController;
}>();

const selected = props.config.selected;

const item = computed(() => props.config.list[selected.value]);

onUnmounted(() => {
    props.config.added = false;
    props.config.list.splice(0);
});
</script>

<style lang="less" scoped>
.config-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 8px 2px;
}

.config-list-one {
    font-size: 16px;
    margin: 2px 5px;
    padding: 2px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.1s linear;
}

.config-list-one:hover,
.config-list-one[selected='true'] {
    border-radius: 5px;
    background-color: #444;
}

.config-delete {
    padding: 2px;
    border-radius: 3px;
    transition: background-color 0.1s linear;
}

.config-delete:hover {
    background-color: rgb(255, 77, 79);
}
</style>
