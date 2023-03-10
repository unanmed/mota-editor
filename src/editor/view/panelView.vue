<template>
    <div
        class="panel-one"
        :id="`panel-one-${panel.num}`"
        :style="{
            left: `${left}px`,
            width: `${width}px`,
            top: `${top}px`,
            height: `${height}px`,
            zIndex: panel.zIndex.value
        }"
        @mousedown.stop="focus"
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
        <div
            class="panel-content unique-scroll"
            :style="{ borderColor }"
            v-if="!mined"
        >
            <Panel
                :name="name"
                :type="type"
                :props="p"
                :num="panel.num"
            ></Panel>
        </div>
        <div
            v-if="!mined"
            class="border-left border"
            @mousedown="beginResize($event, 'left')"
        ></div>
        <div
            v-if="!mined"
            class="border-right border"
            @mousedown="beginResize($event, 'right')"
        ></div>
        <div
            v-if="!mined"
            class="border-top border"
            @mousedown="beginResize($event, 'top')"
        ></div>
        <div
            v-if="!mined"
            class="border-bottom border"
            @mousedown="beginResize($event, 'bottom')"
        ></div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
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
if (content.clientWidth < width.value - 2)
    width.value = content.clientWidth - 2;
if (content.clientHeight < height.value - 2)
    height.value = content.clientHeight - 2;

const maxWidth = props.panel.maxWidth || Infinity;
const maxHeight = props.panel.maxHeight || Infinity;
const { minWidth, minHeight } = props.panel;

const borderColor = computed(() => {
    return props.panel.focused.value ? '#fff' : '#888';
});

let moved = false;

let winWidth = content.clientWidth;
let winHeight = content.clientHeight;

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
    if (!mined.value) {
        beforeHeight_min = maxed.value ? beforeHeight : height.value;
        height.value = 28;
        mined.value = true;
    } else {
        height.value = beforeHeight_min;
        mined.value = false;
    }
    maxed.value = false;
}

/**
 * 关闭
 */
function close() {
    if (moved) return;
    view.remove(props.panel);
    props.panel.close();
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
    dragLeft(e);
    dragRight(e);
    dragTop(e);
    dragBottom(e);
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

function mouseup() {
    setTimeout(() => {
        dragging = false;
        moved = false;
        leftDrag = false;
        rightDrag = false;
        bottomDrag = false;
        topDrag = false;
    });
}

// 边框
let leftDrag = false;
let rightDrag = false;
let topDrag = false;
let bottomDrag = false;
let leftBefore = 0;
let topBefore = 0;
let beforeWidth_b = 0;
let beforeHeight_b = 0;

function beginResize(e: MouseEvent, type: string) {
    const { clientX, clientY } = e;
    startX = clientX;
    startY = clientY;
    if (type === 'left') {
        leftBefore = left.value;
        leftDrag = true;
        beforeWidth_b = width.value;
    } else if (type === 'top') {
        topBefore = top.value;
        topDrag = true;
        beforeHeight_b = height.value;
    } else if (type === 'bottom') {
        bottomDrag = true;
        beforeHeight_b = height.value;
    } else {
        rightDrag = true;
        beforeWidth_b = width.value;
    }
}

function dragLeft(e: MouseEvent) {
    if (!leftDrag) return;
    const { clientX, clientY } = e;
    const { clientWidth, clientHeight } = content;
    const dx = clientX - startX;

    let toX = dx + leftBefore;
    let toWidth = beforeWidth_b - dx;

    if (toWidth < minWidth) {
        toWidth = minWidth;
        toX = leftBefore + beforeWidth_b - minWidth;
    }
    if (toX > clientWidth - 40) {
        toX = clientWidth - 40;
        toWidth = beforeWidth_b - toX + leftBefore;
    }
    if (toWidth > maxWidth) {
        toWidth = maxWidth;
        toX = leftBefore + beforeWidth_b - maxWidth;
    }
    left.value = toX;
    width.value = toWidth;
}

function dragRight(e: MouseEvent) {
    if (!rightDrag) return;
    const { clientX, clientY } = e;
    const dx = clientX - startX;

    let toWidth = beforeWidth_b + dx;
    if (toWidth < minWidth) toWidth = minWidth;
    if (toWidth > maxWidth) toWidth = maxWidth;
    if (left.value + toWidth < 40) toWidth = 40 - left.value;

    width.value = toWidth;
}

function dragTop(e: MouseEvent) {
    if (!topDrag) return;
    const { clientX, clientY } = e;
    const { clientWidth, clientHeight } = content;
    const dy = clientY - startY;

    let toY = dy + topBefore;
    let toHeight = beforeHeight_b - dy;

    if (toHeight < minHeight) {
        toHeight = minHeight;
        toY = topBefore + beforeHeight_b - minHeight;
    }
    if (toY > clientHeight - 28) {
        toY = clientHeight - 28;
        toHeight = beforeHeight_b - toY + topBefore;
    }
    if (toY < 0) {
        toY = 0;
        toHeight = beforeHeight_b + topBefore;
    }
    if (toHeight > maxHeight) {
        toHeight = maxHeight;
        toY = topBefore + beforeWidth_b - maxHeight;
    }
    top.value = toY;
    height.value = toHeight;
}

function dragBottom(e: MouseEvent) {
    if (!bottomDrag) return;
    const { clientX, clientY } = e;
    const dy = clientY - startY;

    let toHeight = beforeHeight_b + dy;
    if (toHeight < minHeight) toHeight = minHeight;
    if (toHeight > maxHeight) toHeight = maxHeight;
    if (top.value + toHeight < 40) toHeight = 40 - top.value;

    height.value = toHeight;
}

function relocate(e: UIEvent) {
    requestAnimationFrame(() => {
        const { clientWidth, clientHeight } = content;
        const ratioX = clientWidth / winWidth;
        const ratioY = clientHeight / winHeight;
        winWidth = clientWidth;
        winHeight = clientHeight;
        left.value *= ratioX;
        top.value *= ratioY;
    });
}

onMounted(() => {
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', drag);
    window.addEventListener('resize', relocate);
});

onUnmounted(() => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', mouseup);
    window.removeEventListener('resize', relocate);
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
        overflow: hidden auto;
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

// 边框

.border {
    position: absolute;
}

.border-left {
    width: 0;
    height: 100%;
    border-left: 10px solid transparent;
    left: 0;
    top: 0;
    cursor: ew-resize;
    transform: translateX(-5px);
}

.border-right {
    width: 0;
    height: 100%;
    border-right: 10px solid transparent;
    right: 0;
    top: 0;
    cursor: ew-resize;
    transform: translateX(10px);
}

.border-top {
    width: 100%;
    height: 0;
    border-top: 10px solid transparent;
    left: 0;
    top: 0;
    cursor: ns-resize;
    transform: translateY(-5px);
}

.border-bottom {
    width: 100%;
    height: 0;
    border-bottom: 10px solid transparent;
    left: 0;
    bottom: 0;
    cursor: ns-resize;
    transform: translateY(5px);
}
</style>
