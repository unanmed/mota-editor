<template>
    <Multi :controller="selection">
        <template #left>
            <div class="select-list unique-scroll">
                <div
                    class="select-list-one"
                    :selected="i === selected"
                    v-for="(select, i) of selection.list"
                    @click="selection.select(i)"
                >
                    <span class="file-name">
                        <span>{{ select.name }}</span>
                    </span>
                    <CloseOutlined
                        class="file-close"
                        @click.stop="selection.remove(i)"
                    />
                </div>
            </div>
        </template>
        <template #right>
            <span v-if="!show" class="select-empty">Selection Editor</span>
            <div v-else class="select-main unique-scroll">
                <span
                    class="select-doc"
                    v-html="parseDoc(select.info.doc)"
                ></span>
                <a-divider class="divider"></a-divider>
                <div class="select-data">
                    <div class="select-all">
                        <a-checkbox
                            :checked="checkAll"
                            :indeterminate="indeterminate"
                            >全选</a-checkbox
                        >
                        <a-checkbox
                            :disabled="cannotDefaultAll"
                            :checked="select.defaultAll"
                            >默认全选</a-checkbox
                        >
                    </div>
                    <a-divider class="divider"></a-divider>
                    <div class="select-selection">
                        <div v-for="(select, i) in selectList">
                            <a-checkbox
                                v-model:checked="select.root.selected"
                                :disabled="!!select.disabled"
                            >
                                {{ select.text }}
                                <span v-if="select.warn" class="select-warn">{{
                                    select.warn
                                }}</span>
                            </a-checkbox>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Multi>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Multi from '../multi/multi.vue';
import { FiledSelectSuffix, Select, SelectionController } from './select';
import { CloseOutlined } from '@ant-design/icons-vue';
import { parseDoc } from '../../../../editor/utils/utils';

interface DecoratedString {
    root: Select;
    text: string;
    disabled?: boolean;
    warn?: string;
}

const props = defineProps<{
    selection: SelectionController;
}>();
const selected = props.selection.selected;

const select = computed(() => props.selection.list[selected.value]);
const show = computed(() => props.selection.list.length > 0 && !!select.value);

const checkAll = computed(() => {
    return !!select.value?.choice.every(v => v.selected);
});
const indeterminate = computed(
    () => !!select.value?.choice.some(v => v.selected)
);

const cannotDefaultAll = computed(() => !select.value?.canDefaultAll);

const selectList = computed<DecoratedString[]>(() => {
    const list = select.value?.choice;
    if (!list) return [];
    return list.map(v => {
        if (select.value.info.target === 'file') {
            const content = applyDecorator(v, select.value.suffix);
            return content;
        } else {
            return { root: v, text: v.text };
        }
    });
});

function applyDecorator(
    str: Select,
    fn: Record<string, FiledSelectSuffix[]>
): DecoratedString {
    const suffix = str.text.split('.').at(-1);
    if (!suffix || !fn[suffix]) {
        return {
            root: str,
            text: str.text
        };
    }
    const decorator = fn[suffix];
    const data: DecoratedString = {
        root: str,
        text: str.text
    };
    decorator.forEach(v => {
        if (v.fn === 'uncancelable' && str.selected) data.disabled = true;
        if (v.fn === 'hide') data.text = data.text.replace(`.${suffix}`, '');
        if (v.fn === 'warn') data.warn = v.params[0];
    });

    return data;
}
</script>

<style lang="less" scoped>
.select-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 8px 2px;
}

.select-empty {
    width: 100%;
    height: 100%;
    background-color: #222;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.select-list-one {
    font-size: 16px;
    margin: 2px 5px;
    padding: 2px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.1s linear;
}

.select-list-one:hover,
.select-list-one[selected='true'] {
    border-radius: 5px;
    background-color: #444;
}

.file-name {
    display: flex;
    align-items: center;
}

.file-close {
    padding: 2px;
    border-radius: 3px;
    transition: background-color 0.1s linear;
}

.file-close:hover {
    background-color: #888;
}

.divider {
    border-color: #666;
    margin: 6px 0 6px 0;
}

.select-main {
    font-size: 16px;
    padding: 20px;
    width: 100%;
    height: 100%;
}

.select-data {
    user-select: none;
}

.select-all {
    display: flex;
    justify-content: space-between;
    padding: 0 32px;
}

.select-main ::v-deep .ant-checkbox + span {
    font-size: 16px;
}

.select-warn {
    margin-left: 10px;
    color: yellow;
    font-weight: bold;
}
</style>
