<template>
    <div class="multi-root" :id="`multi-root-${num}`">
        <div
            class="multi-left"
            :style="{
                width: `${width}px`,
                maxWidth: `${max}px`,
                minWidth: `${min}px`
            }"
        >
            <slot name="left"></slot>
        </div>
        <div class="splitter" @mousedown="beginDrag"></div>
        <div
            class="multi-right"
            :id="`multi-right-${num}`"
            :style="{
                width: `calc(100% - ${width + 2}px)`
            }"
        >
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { MultiController } from './multi';

let root: HTMLDivElement;
let left: HTMLDivElement;
let right: HTMLDivElement;

let mutation: MutationObserver;

interface ResizeEvent {
    list: MutationRecord[];
    observer: MutationObserver;
}

const props = defineProps<{
    controller: MultiController;
    leftMax?: number;
    leftMin?: number;
    leftWidth?: number;
}>();
const emits = defineEmits<{
    (e: 'resize', data: ResizeEvent): void;
}>();

const num = props.controller.num;
const width = ref(props.leftWidth ?? 200);
const min = props.leftMin ?? 100;
const max = props.leftMax ?? 300;

let xBefore = 0;
let leftBefore = 0;
let dragging = false;

function beginDrag(e: MouseEvent) {
    xBefore = e.clientX;
    leftBefore = width.value;
    dragging = true;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', mouseup);
}

function drag(e: MouseEvent) {
    if (!dragging) return;
    const x = e.clientX;
    const dx = x - xBefore;
    let toLeft = leftBefore + dx;
    if (toLeft < min) toLeft = min;
    if (toLeft > max) toLeft = max;
    width.value = toLeft;
}

function mouseup() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', mouseup);
    setTimeout(() => {
        dragging = false;
    });
}

function resize() {
    mutation = new MutationObserver((list, observer) => {
        emits('resize', { list, observer });
    });

    mutation.observe(right, {
        attributes: true,
        attributeFilter: ['style']
    });
}

onMounted(async () => {
    right = document.getElementById(`multi-right-${num}`) as HTMLDivElement;

    resize();
});

onUnmounted(() => {
    mutation.disconnect();
});
</script>

<style lang="less" scoped>
.multi-root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;
}

.splitter {
    height: 100%;
    width: 2px;
    background-color: #fff;
    cursor: ew-resize;
    z-index: 1;
    transition: transform 0.2s ease;
}

.splitter:hover,
.splitter:active {
    transform: scaleX(300%);
}

.multi-right {
    position: relative;
}
</style>
