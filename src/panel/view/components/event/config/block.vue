<template>
    <div class="block-config unique-scroll">
        <span class="config-text">事件集配置项</span>
        <span class="config-text"
            >注意这里的配置项只会影响编辑器，游戏中的具体实现应该在样板中使用<span
                style="font-family: code"
            >
                registerEvent </span
            >实现</span
        >
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
                    @change="block.emitSave()"
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
                @change="block.emitSave()"
            ></a-input>
        </div>
        <div class="block-input">
            <span class="text"><Required />事件集id</span>
            <a-divider type="vertical" class="divider"></a-divider>
            <a-input
                class="input"
                v-model:value="data.id"
                spellcheck="false"
                @change="block.emitSave()"
            ></a-input>
        </div>
        <a-divider style="margin: 12px 0; background-color: #666"></a-divider>
        <Table :n="0" use-slot>
            <template #name> 事件集数据 </template>
            <Table v-for="(item, key) of data.data" :n="1" use-slot>
                <template #name> {{ key }} </template>
                <div class="block-one">
                    <span class="text"><Required />事件类型</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input
                        class="input"
                        v-model:value="item.type"
                        @change="block.emitSave()"
                    ></a-input>
                </div>
                <div class="block-one">
                    <span class="text">事件名称</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input
                        class="input"
                        v-model:value="item.text"
                        @change="block.emitSave()"
                    ></a-input>
                </div>
                <div class="block-one">
                    <span class="text">序列化代码</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-button class="button" @click="editStringify(item)"
                        >编辑</a-button
                    >
                </div>
                <Table :n="2" use-slot>
                    <template #name>参数列表</template>
                    <template v-if="!!item.params">
                        <Param
                            v-for="(p, i) in item.params"
                            :param="p"
                            :index="i"
                            :path="`${block.name}/param/${i}`"
                            :block="block"
                            :item="item"
                            :key="p.key ?? i"
                        ></Param>
                    </template>
                    <div class="block-one param-add">
                        <span class="text" @click="addParam(item)"
                            >+ 新增参数</span
                        >
                    </div>
                </Table>
            </Table>
        </Table>
    </div>
</template>

<script lang="ts" setup>
import { EventBlockConfig } from '../../../event/config';
import { MotaEventInfo } from '../../../event/event';
import Table from '../../table/table.vue';
import Param from './param/param.vue';
import { Required } from '../../../../components/utils';
import { addCodeFile } from '../../code/code';
import { Uri } from 'monaco-editor';
import { generateStringifyDeclaration } from './declare';

const props = defineProps<{
    block: EventBlockConfig;
}>();

const data = props.block.data;

async function editStringify(block: MotaEventInfo) {
    const content = (block.format ?? ['return params.format();']).join('\n');
    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: `${block.type}/format`
    });
    const file = addCodeFile(`序列化代码`, content, 'javascript', uri);
    if (!file) return;
    const d = await generateStringifyDeclaration(block);

    file.setExtraLib([d]);
    file.on('save', async content => {
        block.format = content.split('\n');
        props.block.emitSave();
        return true;
    });
}

function addParam(item: MotaEventInfo) {
    item.params?.push({
        type: 'comment',
        text: '显示文字'
    });
    props.block.emitSave();
}
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

.param-add {
    background-color: #2e5e26;
    border-bottom: 1px solid #888;
    cursor: pointer;
}
</style>
