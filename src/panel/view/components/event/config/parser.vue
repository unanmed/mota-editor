<template>
    <div class="event-parser unique-scroll">
        <span class="config-text">事件解析器配置项</span>
        <span class="config-text"
            >事件解析器用于将事件<span style="font-family: code"> json </span
            >转化为可以直接被事件渲染器渲染出来的对象。具体写法可参考编辑器自带的配置项。
            更多信息请参考编辑器使用手册</span
        >
        <a-divider style="margin: 12px 0; background-color: #666"></a-divider>
        <div class="parser-edit">
            <span class="text">解析器代码</span>
            <a-divider type="vertical" class="divider"></a-divider>
            <a-button class="edit-button" @click="edit">编辑</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Uri } from 'monaco-editor';
import { EventParserConfig } from '../../../event/config';
import { addCodeFile } from '../../code/code';

const props = defineProps<{
    parser: EventParserConfig;
}>();

function edit() {
    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: `${props.parser.name}/parser`
    });
    const content = props.parser.data;
    const file = addCodeFile('事件解析器', content, 'javascript', uri);

    file?.on('save', async content => {
        props.parser.data = content;
        props.parser.emitSave();
        return true;
    });
}
</script>

<style lang="less" scoped>
.event-parser {
    font-size: 16px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.parser-edit {
    display: flex;
    width: 100%;
    align-items: center;
    margin: 4px 0;

    .edit-button {
        width: 100px;
        font-size: 16px;
    }

    .text {
        width: 100px;
        text-align: end;
    }
}

.divider {
    background-color: #888;
    margin-left: 20px;
    margin-right: 20px;
}
</style>
