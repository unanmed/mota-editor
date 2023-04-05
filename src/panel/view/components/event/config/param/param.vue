<template>
    <div class="param-root">
        <Table :n="1" use-slot>
            <template #name>
                <div class="param-name">
                    <span>第 {{ index + 1 }} 个参数</span>
                    <DeleteOutlined
                        class="param-delete"
                        @click.stop="deleteParam"
                    />
                </div>
            </template>
            <div class="block-one">
                <span class="text"><Required />参数类型</span>
                <a-divider class="divider" type="vertical"></a-divider>
                <a-select class="block-select" v-model:value="param.type">
                    <a-select-option
                        class="block-select-option"
                        v-for="(name, key) of typeName"
                        :value="key"
                        >{{ name }}</a-select-option
                    >
                </a-select>
            </div>
            <div class="block-one">
                <span class="text">{{
                    param.type === 'comment' ? '显示文字' : '参数说明'
                }}</span>
                <a-divider class="divider" type="vertical"></a-divider>
                <a-input
                    class="block-input"
                    v-model:value="param.text"
                    @change="block.emitSave()"
                ></a-input>
            </div>
            <template v-if="param.type !== 'comment'">
                <div class="block-one">
                    <span class="text">参数名称</span>
                    <a-divider class="divider" type="vertical"></a-divider>
                    <a-input
                        class="block-input"
                        v-model:value="param.key"
                        @change="block.emitSave()"
                    ></a-input>
                </div>
                <div class="block-one">
                    <span class="text">参数默认值</span>
                    <a-divider class="divider" type="vertical"></a-divider>
                    <a-input
                        class="block-input"
                        :error="defaultError"
                        v-model:value="defaultValue"
                        @change="onDefaultValueChange()"
                    ></a-input>
                    <span class="block-input-error" v-show="defaultError"
                        >输入值不合法</span
                    >
                </div>
                <template v-if="param.type === 'block'">
                    <div class="block-one">
                        <span class="text">允许的事件块</span>
                        <a-divider class="divider" type="vertical"></a-divider>
                        <a-button
                            class="block-edit"
                            @click="
                                addCode(
                                    '允许的事件块',
                                    `/required`,
                                    'json',
                                    param,
                                    'require',
                                    []
                                )
                            "
                            >编辑</a-button
                        >
                    </div>
                </template>
                <template v-if="param.type === 'select'">
                    <Table :n="2" use-slot>
                        <template #name>选择项</template>
                        <template v-if="!!param.value && !!param.show">
                            <Table
                                :n="1"
                                use-slot
                                v-for="(v, i) of param.value"
                            >
                                <template #name>第 {{ i + 1 }} 个选项</template>
                                <div class="block-one">
                                    <span class="text">选项的值</span>
                                    <a-divider
                                        class="divider"
                                        type="vertical"
                                    ></a-divider>
                                    <a-input
                                        class="block-input"
                                        v-model:value="param.value[i]"
                                        @change="block.emitSave()"
                                    ></a-input>
                                </div>
                                <div class="block-one">
                                    <span class="text">选项显示内容</span>
                                    <a-divider
                                        class="divider"
                                        type="vertical"
                                    ></a-divider>
                                    <a-input
                                        class="block-input"
                                        v-model:value="param.show[i]"
                                        @change="block.emitSave()"
                                    ></a-input>
                                </div>
                            </Table>
                        </template>
                    </Table>
                </template>
                <Table :n="2" use-slot>
                    <template #name>错误信息</template>
                    <template v-if="!!param.error">
                        <Table v-for="(e, i) of param.error" :n="1" use-slot>
                            <template #name>第 {{ i + 1 }} 个错误信息</template>
                            <div class="block-one">
                                <span class="text">匹配正则</span>
                                <a-divider
                                    class="divider"
                                    type="vertical"
                                ></a-divider>
                                <a-input
                                    class="block-input"
                                    v-model:value="e.regexp"
                                    @change="block.emitSave()"
                                ></a-input>
                            </div>
                            <div class="block-one">
                                <span class="text">抛出错误</span>
                                <a-divider
                                    class="divider"
                                    type="vertical"
                                ></a-divider>
                                <a-button
                                    class="block-edit"
                                    @click="
                                        addCode(
                                            '抛出错误',
                                            `/error/${i}/throw`,
                                            'text',
                                            e,
                                            'throw',
                                            []
                                        )
                                    "
                                    >编辑</a-button
                                >
                            </div>
                        </Table>
                    </template>
                </Table>
            </template>
        </Table>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
    MotaEventInfo,
    MotaEventParam,
    typeName
} from '../../../../event/event';
import Table from '../../../table/table.vue';
import { debounce } from 'lodash';
import { Required } from '../../../../../components/utils';
import { CodeFormat, addCodeFile } from '../../../code/code';
import { Uri } from 'monaco-editor';
import { EventBlockConfig } from '../../../../event/config';
import { DeleteOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    param: MotaEventParam;
    index: number;
    path: string;
    block: EventBlockConfig;
    item: MotaEventInfo;
}>();

const defaultValue = ref(JSON.stringify(props.param.default));
const defaultError = ref(false);

const onDefaultValueChange = debounce(() => {
    if (defaultValue.value === '') {
        delete props.param.default;
        defaultError.value = false;
        props.block.emitSave();
        return;
    }
    try {
        const value = JSON.parse(defaultValue.value);
        props.param.default = value;
        defaultError.value = false;
        props.block.emitSave();
    } catch {
        defaultError.value = true;
    }
}, 500);

function addCode(
    name: string,
    path: string,
    type: CodeFormat,
    root: any,
    key: string,
    defaults?: any
) {
    const value = root[key];
    const isArr = value instanceof Array;
    const content = isArr
        ? value.join('\n')
        : type === 'json'
        ? JSON.stringify(value ?? defaults)
        : value ?? defaults;
    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: props.path + '/' + path
    });
    const file = addCodeFile(name, content, type, uri);

    file?.on('save', async content => {
        if (type === 'json') root[key] = JSON.parse(content);
        else if (isArr) root[key] = content.split('\n');
        else root[key] = content;
        props.block.emitSave();
        return true;
    });
}

function deleteParam() {
    props.item.params?.splice(props.index, 1);
    props.block.emitSave();
}
</script>

<style lang="less" scoped>
.divider {
    background-color: #888;
}

.block-select {
    font-size: 16px;
    width: calc(100% - 184px);
    max-width: 200px;
}

.block-input {
    font-size: 16px;
    width: calc(100% - 184px);
}

.block-input[error] {
    width: calc(100% - 284px);
}

.block-input[error='true'] {
    border-color: lightcoral;
}

.block-input-error {
    margin-left: 24px;
    color: lightcoral;
}

.block-edit {
    font-size: 16px;
    width: 100px;
}

.param-name {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .param-delete {
        margin-right: 24px;
        padding: 2px;
        border-radius: 3px;
        transition: background-color 0.2s linear;
    }

    .param-delete:hover {
        background-color: rgb(255, 77, 79);
    }
}
</style>
