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
            <div
                v-else-if="select.type === 'multi'"
                class="select-main unique-scroll"
            >
                <span
                    class="select-doc"
                    v-html="parseDoc(select.info.doc)"
                ></span>
                <span class="select-doc" v-if="select.info.target === 'file'">
                    <a-divider class="divider"></a-divider>
                    注：默认全选是指当对应文件夹的内容改变时，是否将增加的内容直接选中。
                    例如当图片文件夹中新增了一个123.png时，如果勾上了默认全选，那么编辑器将会自动选中该文件。
                    此选项仅在选项编辑器中存在对应的编辑项的情况下有效。
                </span>
                <a-divider class="divider"></a-divider>
                <div class="select-data">
                    <div class="select-all">
                        <a-checkbox
                            :checked="checkAll"
                            :indeterminate="indeterminate"
                            @change="triggerAll()"
                            >全选</a-checkbox
                        >
                        <a-checkbox
                            v-if="select.info.target === 'file'"
                            :disabled="cannotDefaultAll"
                            :checked="select.defaultAll.value"
                            @change="setDefaultAll()"
                            >默认全选</a-checkbox
                        >
                    </div>
                    <a-divider class="divider"></a-divider>
                    <div class="select-selection">
                        <div
                            v-for="(selection, i) in selectList"
                            class="select-checkbox"
                        >
                            <a-checkbox
                                :key="selection.text"
                                v-model:checked="selection.root.selected"
                                :disabled="!!selection.disabled"
                                @change="save(true)"
                            >
                                {{ selection.show || selection.text }}
                                <span
                                    v-if="selection.warn"
                                    class="select-warn"
                                    >{{ selection.warn }}</span
                                >
                            </a-checkbox>
                            <a-button
                                v-if="!!selection.preview"
                                @click="changePreview(selection)"
                                >预览</a-button
                            >
                            <div
                                v-if="!!selection.previewing?.value"
                                class="select-preview"
                            >
                                <img
                                    v-if="selection.preview === 'image'"
                                    :src="selection.previewImage!.value"
                                />
                                <div v-if="selection.preview === 'audio'">
                                    <div class="preview-audio-buttons">
                                        <span>
                                            <a-button
                                                @click="
                                                    selection.previewAudio?.trigger()
                                                "
                                                >{{
                                                    selection.previewAudio
                                                        ?.playing.value
                                                        ? '暂停'
                                                        : '播放'
                                                }}</a-button
                                            >
                                            <a-button
                                                @click="
                                                    selection.previewAudio?.ready()
                                                "
                                                >停止</a-button
                                            >
                                        </span>
                                        <a-button
                                            @click="
                                                selection.previewAudio?.getData()
                                            "
                                            >刷新</a-button
                                        >
                                    </div>
                                    <a-progress
                                        :percent="
                                            selection.previewAudio?.progress
                                                ?.value ?? 0
                                        "
                                        :showInfo="false"
                                    ></a-progress>
                                </div>
                                <a-divider class="divider"></a-divider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="select-main unique-scroll">
                <span
                    class="select-doc"
                    v-html="parseDoc(select.info.doc)"
                ></span>
                <a-divider class="divider"></a-divider>
                <div class="select-data">
                    <div class="select-selection">
                        <a-radio
                            class="radio"
                            v-for="selection of selectList"
                            :checked="selection.root.selected"
                            @click="onSingleChange(selection)"
                            >{{ selection.show || selection.text }}
                        </a-radio>
                    </div>
                </div>
            </div>
        </template>
    </Multi>
</template>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, Ref, ref } from 'vue';
import Multi from '../multi/multi.vue';
import {
    FiledSelectSuffix,
    Select,
    SelectionController,
    changeDefaultAll
} from './select';
import { CloseOutlined } from '@ant-design/icons-vue';
import { parseDoc } from '../../../../editor/utils/utils';
import { debounce, sortBy } from 'lodash';
import { AudioPreviewer } from './preview';

interface DecoratedString {
    root: Select;
    text: string;
    show?: string;
    disabled?: boolean;
    warn?: string;
    preview?: 'image' | 'audio';
    previewing?: Ref<boolean>;
    previewImage?: Ref<string>;
    previewAudio?: AudioPreviewer;
}

const audios: AudioPreviewer[] = [];

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
    () => !!select.value?.choice.some(v => v.selected) && !checkAll.value
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
            return { root: v, text: v.text, show: v.show };
        }
    });
});

/**
 * 后缀修饰符
 */
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
        text: str.text,
        previewing: ref(false),
        previewImage: ref('')
    };
    decorator.forEach(v => {
        if (v.fn === 'uncancelable' && str.selected) data.disabled = true;
        if (v.fn === 'hide') data.text = data.text.replace(`.${suffix}`, '');
        if (v.fn === 'warn') data.warn = v.params[0];
        if (v.fn === 'previewImage') data.preview = 'image';
        if (v.fn === 'previewAudio') data.preview = 'audio';
    });

    return data;
}

function setDefaultAll(value: boolean = !select.value.defaultAll.value) {
    if (select.value.canDefaultAll) {
        select.value.defaultAll.value = value;
        if (select.value.defaultAll.value) {
            triggerAll(true);
        }
    } else {
        select.value.defaultAll.value = false;
    }
    changeDefaultAll(select.value);
}

function triggerAll(value: boolean = !checkAll.value) {
    select.value.choice.forEach((v, i) => {
        if (!selectList.value[i].disabled) v.selected = value;
    });
    nextTick(() => {
        save(true);
    });
}

function checkDefaultAll() {
    if (!checkAll.value) setDefaultAll(false);
}

function save(check?: boolean) {
    if (check) checkDefaultAll();
    select.value.save();
}

// need debounce
const singleSave = debounce(save, 100);
function onSingleChange(str: DecoratedString) {
    select.value.updateSelected(str.text);
    singleSave();
}

function getAbsolutePath(file: string) {
    return select.value.base + '/' + select.value.info.path + '/' + file;
}

/**
 * 图片预览
 */
async function getImageBase64Data(file: string, str: DecoratedString) {
    const path = getAbsolutePath(file);
    const suffix = file.split('.').at(-1)!;
    const base64 = await window.editor.file.read(path, 'base64');
    const res = `data:image/${suffix};base64,${base64}`;
    str.previewImage!.value = res;
}

function getAudioPreviewData(str: DecoratedString) {
    const path = getAbsolutePath(str.text);
    const previewer = new AudioPreviewer(path);
    str.previewAudio = previewer;
    audios.push(previewer);
}

function changePreview(selection: DecoratedString) {
    selection.previewing!.value = !selection.previewing!.value;
    if (selection.preview === 'audio') {
        selection.previewAudio?.ticker.clear();
    }
    if (!selection.previewing!.value) return;
    if (selection.preview === 'image') {
        getImageBase64Data(selection.text, selection);
    } else if (selection.preview === 'audio') {
        selection.previewAudio?.ready();
        if (!selection.previewAudio) getAudioPreviewData(selection);
    }
}

onUnmounted(() => {
    props.selection.added = false;
    props.selection.list.splice(0);
    audios.forEach(v => v.destroy());
});
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

.select-main :deep(.ant-checkbox + span) {
    font-size: 16px;
}

.select-warn {
    margin-left: 10px;
    color: yellow;
    font-weight: bold;
}

.select-selection {
    display: flex;
    flex-direction: column;

    .radio {
        margin: 4px 12px;
        font-size: 16px;
    }
}

.select-checkbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 24px;
    flex-wrap: wrap;

    :deep(.ant-btn) {
        font-size: 16px;
    }
}

.select-preview {
    width: 100%;

    img {
        max-width: 100%;
    }

    .preview-audio-buttons {
        display: flex;
        justify-content: space-between;
    }
}
</style>
