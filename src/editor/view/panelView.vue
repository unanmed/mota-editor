<template>
    <div
        class="panel-one"
        :style="{
            left: `${left}px`,
            width: `${width}px`,
            top: `${top}px`,
            height: `${height}px`,
            zIndex: panel.zIndex.value
        }"
        @click="focus"
    >
        <div
            class="panel-info"
            :style="{
                borderColor
            }"
            @mousedown="beginDrag"
        >
            <span>{{ name }}</span>
            <div class="panel-tools">
                <download-outlined
                    class="panel-top panel-tool"
                    :actived="toped"
                    @click="toTop"
                />
                <minus-outlined class="panel-min panel-tool" @click="minSize" />
                <border-outlined
                    v-if="!maxed"
                    class="panel-max panel-tool"
                    @click="maxSize"
                />
                <block-outlined
                    v-else
                    class="panel-normal panel-tool"
                    @click="unmaxSize"
                />
                <CloseOutlined class="panel-close panel-tool" @click="close" />
            </div>
        </div>
        <div class="panel-content" :style="{ borderColor }" v-if="!mined">
            <Panel :name="name" :type="type" :props="p"></Panel>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Panel as P, PanelType } from './panel';
import {
    CloseOutlined,
    BorderOutlined,
    MinusOutlined,
    BlockOutlined,
    DownloadOutlined
} from '@ant-design/icons-vue';
import { Panel } from './view';
import { computed, onMounted, ref } from 'vue';
import { content, view } from './control';

const maxed = ref(false);
const mined = ref(false);
const toped = ref(false);

const left = ref<number>(0);
const width = ref<number>(0);
const top = ref<number>(0);
const height = ref<number>(0);

const props = defineProps<{
    name: string;
    type: PanelType;
    p: any;
    panel: P<PanelType>;
}>();

width.value = props.panel.width;
height.value = props.panel.height;

const maxWidth = props.panel.maxWidth || Infinity;
const maxHeight = props.panel.maxHeight || Infinity;

const borderColor = computed(() => {
    return props.panel.focused.value ? '#fff' : '#888';
});

let moved = false;

/**
 * 聚焦到这个窗口
 */
function focus() {
    view.list.forEach(v => {
        v.focused.value = false;
        if (v.toped) v.zIndex.value = 10;
        else v.zIndex.value = 0;
    });
    props.panel.focused.value = true;
    props.panel.zIndex.value = 1;
}

let beforeWidth = width.value;
let beforeHeight = height.value;
let beforeX = left.value;
let beforeY = top.value;

/**
 * 最大化
 */
function maxSize() {
    if (moved) return;
    const { clientWidth, clientHeight } = content;
    const toWidth = clientWidth > maxWidth ? maxWidth : clientWidth - 2;
    const toHeight = clientHeight > maxHeight ? maxHeight : clientHeight;
    const toX = left.value + toWidth > clientWidth ? 0 : left.value;
    const toY = top.value + toHeight > clientHeight ? 0 : top.value;
    beforeWidth = width.value;
    beforeHeight = mined.value ? beforeHeight_min : height.value;
    beforeX = left.value;
    beforeY = top.value;
    left.value = toX;
    top.value = toY;
    width.value = toWidth;
    height.value = toHeight;
    maxed.value = true;
    mined.value = false;
}

/**
 * 取消最大化
 */
function unmaxSize() {
    if (moved) return;
    left.value = beforeX;
    top.value = beforeY;
    width.value = beforeWidth;
    height.value = beforeHeight;
    maxed.value = false;
    mined.value = false;
}

let beforeHeight_min = 0;

/**
 * 最小化
 */
function minSize() {
    if (moved) return;
    maxed.value = false;
    if (!mined.value) {
        beforeHeight_min = height.value;
        height.value = 28;
        mined.value = true;
    } else {
        height.value = beforeHeight_min;
        mined.value = !mined.value;
    }
}

/**
 * 关闭
 */
function close() {
    if (moved) return;
    view.remove(props.panel);
}

/**
 * 置顶
 */
function toTop() {
    if (moved) return;
    if (!toped.value) {
        toped.value = true;
        props.panel.toped = true;
        props.panel.zIndex.value = 10;
    } else {
        toped.value = false;
        props.panel.toped = false;
        props.panel.zIndex.value = 1;
    }
}

let dragging = false;
let startX = 0;
let startY = 0;
let winX = 0;
let winY = 0;

/**
 * 准备拖拽
 */
function beginDrag(e: MouseEvent) {
    if (dragging) return;
    dragging = true;
    const { clientX, clientY } = e;
    startX = clientX;
    startY = clientY;
    winX = left.value;
    winY = top.value;
}

/**
 * 拖拽
 */
function drag(e: MouseEvent) {
    if (!dragging) return;
    const { clientX, clientY } = e;
    const { clientWidth, clientHeight } = content;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) moved = true;

    let toX = dx + winX;
    let toY = dy + winY;
    if (toX > clientWidth - 40) toX = clientWidth - 40;
    else if (toX + width.value < 40) toX = 40 - width.value;
    if (toY < 0) toY = 0;
    else if (toY > clientHeight - 28) toY = clientHeight - 28;
    left.value = toX;
    top.value = toY;
}

onMounted(() => {
    document.addEventListener('mouseup', () => {
        setTimeout(() => {
            dragging = false;
            moved = false;
        });
    });
    document.addEventListener('mousemove', drag);
});
</script>

<style lang="less" scoped>
.panel-one {
    user-select: none;
    display: flex;
    flex-direction: column;
    background-color: #222;

    .panel-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        padding: 0 8px 0 12px;
        background-color: #444;
        height: 28px;
        border: 1px solid #888;
    }

    .panel-close {
        cursor: pointer;
    }

    .panel-close:hover {
        color: aqua;
    }

    .panel-content {
        width: 100%;
        height: calc(100% - 28px);
        border-bottom: 1px solid;
        border-left: 1px solid;
        border-right: 1px solid;
        overflow: auto;
    }
}

.panel-tools {
    display: flex;
    align-items: center;

    span {
        padding: 4px;
    }
}

.panel-max {
    font-size: 12px;
}

.panel-tool {
    cursor: pointer;
}

.panel-tool:hover {
    color: aqua;
}

.panel-tool[actived='true'] {
    color: rgb(0, 183, 255);
}

.panel-top {
    transform: rotate(180deg);
}
</style>
