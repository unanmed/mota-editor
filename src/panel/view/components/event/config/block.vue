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
                <template #name>
                    <div class="data-key">
                        <div class="data-key-left">
                            <input
                                :id="`key-input-${key}`"
                                class="key-input ant-input"
                                :value="keyFocused === key ? keyEdit : key"
                                spellcheck="false"
                                @click.stop="
                                    (keyFocused = key) && (keyEdit = key)
                                "
                                @input="
                                    checkKey(
                                        ($event.target as HTMLInputElement)
                                            .value,
                                        key
                                    )
                                "
                                @blur="changeKey($event, key)"
                            />
                            <span class="key-error">{{ keyError[key] }}</span>
                        </div>
                        <DeleteOutlined
                            class="data-delete"
                            @click.stop="deleteData(key)"
                        />
                    </div>
                </template>
                <div class="block-one">
                    <span class="text"><Required />事件类型</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input
                        spellcheck="false"
                        class="input"
                        v-model:value="item.type"
                        @change="block.emitSave()"
                    ></a-input>
                </div>
                <div class="block-one">
                    <span class="text">事件名称</span>
                    <a-divider type="vertical" class="divider"></a-divider>
                    <a-input
                        spellcheck="false"
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
                            :path="`${block.name}/${key}/param/${i}`"
                            :block="block"
                            :item="item"
                        ></Param>
                    </template>
                    <div class="block-one param-add" @click="addParam(item)">
                        <span class="text">+ 新增参数</span>
                    </div>
                </Table>
            </Table>
            <div class="block-one param-add" @click="addData()">
                <span class="text">+ 新增事件</span>
            </div>
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
import { nextTick, onUpdated, reactive, ref } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { DebouncedFunc, cloneDeep, debounce } from 'lodash';

const props = defineProps<{
    block: EventBlockConfig;
}>();

const keyError: Record<string, string> = reactive({});
const keyFocused = ref('');
const keyEdit = ref('');

const data = props.block.data;

async function editStringify(block: MotaEventInfo) {
    const content = (block.format ?? ['return params.format();']).join('\n');
    const uri = new Uri().with({
        scheme: 'eventConfig',
        path: `${props.block.name}/${block.type}/format`
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

const checkKey = debounce((key: string, origin: string) => {
    keyEdit.value = key;
    if (key === '') keyError[origin] = '事件id不能为空！';
    else if (key in data.data && key !== origin) {
        keyError[origin] = '事件id不能重复！';
    } else if (key.includes('/') || key.includes('\\')) {
        keyError[origin] = '事件id不能包含 "/" 或 "\\"！';
    } else {
        keyError[origin] = '';
    }
}, 500);

function changeKey(ev: Event, from: string) {
    const input = ev.target as HTMLInputElement;
    keyEdit.value = '';
    keyFocused.value = '';
    if (keyError[from] !== '') {
        if (from === '') {
            delete data.data[''];
        }
        keyError[from] = '';
        return;
    }
    input.blur();
    const to = input.value;
    if (from === to) return;
    const obj = cloneDeep(data.data[from]);
    delete data.data[from];
    data.data[to] = obj;
    props.block.emitSave();
}

const focusInput: DebouncedFunc<() => void> = debounce<() => void>(() => {
    const input = document.getElementById('key-input-') as HTMLInputElement;
    if (!input) return focusInput();
    input.focus();
    keyEdit.value = '';
    keyFocused.value = '';
    checkKey('', '');
    checkKey.flush();
}, 100);

function addData() {
    data.data[''] = {
        type: 'type'
    };
    focusInput();
}

function deleteData(key: string) {
    const c = confirm('确定要删除这个事件吗？');
    if (!c) return;
    delete data.data[key];
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

.data-key {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .data-key-left {
        width: calc(100% - 50px);
        display: flex;
        align-items: center;
    }

    .key-input {
        width: calc(100% - 150px);
        border-color: #888;
        background-color: #222;
        max-width: 200px;
        font-size: 16px;
    }

    .key-input:hover,
    .key-input:focus {
        border-color: aqua;
    }

    .key-error {
        color: lightcoral;
        margin-left: 20px;
        white-space: nowrap;
    }

    .data-delete {
        margin-right: 24px;
        padding: 2px;
        border-radius: 3px;
        transition: background-color 0.2s linear;
    }

    .data-delete:hover {
        background-color: rgb(255, 77, 79);
    }
}
</style>
