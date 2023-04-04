<template>
    <div class="block-config unique-scroll">
        <span class="config-text">事件集配置项</span>
        <a-divider style="margin: 12px 0; background-color: #666"></a-divider>
        <div class="block-input">
            <span class="text">事件块颜色</span>
            <a-divider type="vertical" class="divider"></a-divider>
            <span class="block-color" style="">
                <a-input
                    class="input-color"
                    type="color"
                    v-model:value="data.color"
                ></a-input>
                <a-input
                    spellcheck="false"
                    class="input-color-text"
                    v-model:value="data.color"
                ></a-input>
            </span>
        </div>
        <div class="block-input">
            <span class="text">事件集名称</span>
            <a-divider type="vertical" class="divider"></a-divider>
            <a-input
                class="input"
                v-model:value="data.text"
                spellcheck="false"
            ></a-input>
        </div>
        <div class="block-input">
            <span class="text">事件集id</span>
            <a-divider type="vertical" class="divider"></a-divider>
            <a-input
                class="input"
                v-model:value="data.id"
                spellcheck="false"
            ></a-input>
        </div>
        <a-divider style="margin: 12px 0; background-color: #666"></a-divider>
        <Table :n="0" use-slot>
            <template #name> 事件集数据 </template>
            <Table v-for="(item, key) of data.data" :n="1" use-slot>
                <template #name> {{ key }} </template>
                <div class="block-one">
                    <span class="text"
                        ><span style="color: lightcoral">*</span> 事件类型</span
                    >
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input class="input" v-model:value="item.type"></a-input>
                </div>
                <div class="block-one">
                    <span class="text">事件名称</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input class="input" v-model:value="item.text"></a-input>
                </div>
                <div class="block-one">
                    <span class="text">序列化代码</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-button class="button">编辑</a-button>
                </div>
                <Table :n="2" use-slot>
                    <template #name>参数列表</template>
                    <template v-if="!!item.params">
                        <Param
                            v-for="(p, i) in item.params"
                            :param="p"
                            :index="i"
                        ></Param>
                    </template>
                </Table>
            </Table>
        </Table>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { EventBlockConfig } from '../../../event/config';
import { RightOutlined } from '@ant-design/icons-vue';
import Table from '../../table/table.vue';
import Param from './param/param.vue';

const props = defineProps<{
    block: EventBlockConfig;
}>();

const data = props.block.data;
</script>

<style lang="less" scoped>
.block-config {
    padding: 15px;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.block-input {
    display: flex;
    width: 100%;
    align-items: center;
    margin: 4px 0;

    .text {
        width: 100px;
        text-align: end;
        margin-right: 15px;
    }

    .input {
        margin-left: 15px;
        flex-basis: calc(100% - 200px);
        font-size: 16px;
    }
}

.input-color.ant-input {
    width: 34px;
    height: 34px;
    padding: 4px 6px;
    font-size: 16px;
}

.input-color-text.ant-input {
    width: calc(100% - 34px);
    max-width: 200px;
    font-size: 16px;
}

.divider {
    background-color: #888;
}

.block-color {
    margin-left: 15px;
    flex-basis: calc(100% - 200px);
    display: flex;
    align-items: center;
}
</style>