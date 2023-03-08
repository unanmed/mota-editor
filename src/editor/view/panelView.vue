<template>
    <div
        class="panel-one"
        :style="{
            left: `${left}px`,
            width: `${right - left}px`,
            top: `${top}px`,
            height: `${bottom - top}px`,
            borderColor,
            zIndex: panel.zIndex.value
        }"
        @click="focus"
    >
        <div
            class="panel-info"
            :style="{
                borderBottom: mined ? 'none' : `1px solid ${borderColor}`
            }"
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
        <Panel v-if="!mined" :name="name" :type="type" :props="p"></Panel>
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
import { computed, ref } from 'vue';
import { content, view } from './control';

const maxed = ref(false);
const mined = ref(false);
const toped = ref(false);

const left = ref<number>(0);
const right = ref<number>(0);
const top = ref<number>(0);
const bottom = ref<number>(0);

const props = defineProps<{
    name: string;
    type: PanelType;
    p: any;
    panel: P<PanelType>;
}>();

right.value = props.panel.width;
bottom.value = props.panel.height;

const maxWidth = props.panel.maxWidth || Infinity;
const maxHeight = props.panel.maxHeight || Infinity;

const borderColor = computed(() => {
    return props.panel.focused.value ? '#fff' : '#888';
});

function focus() {
    view.list.forEach(v => {
        v.focused.value = false;
        if (v.toped) v.zIndex.value = 10;
        else v.zIndex.value = 0;
    });
    props.panel.focused.value = true;
    props.panel.zIndex.value = 1;
}

let beforeWidth = right.value;
let beforeHeight = bottom.value;
let beforeX = left.value;
let beforeY = top.value;

function maxSize() {
    const { clientWidth, clientHeight } = content;
    const toWidth = clientWidth > maxWidth ? maxWidth : clientWidth - 2;
    const toHeight = clientHeight > maxHeight ? maxHeight : clientHeight;
    const toX = left.value + toWidth > clientWidth ? clientWidth : left.value;
    const toY = top.value + toHeight > clientHeight ? clientHeight : top.value;
    beforeWidth = right.value - left.value;
    beforeHeight = mined.value ? beforeHeight_min : bottom.value - top.value;
    beforeX = left.value;
    beforeY = top.value;
    left.value = toX;
    top.value = toY;
    right.value = toWidth;
    bottom.value = toHeight;
    maxed.value = true;
    mined.value = false;
}

function unmaxSize() {
    left.value = beforeX;
    top.value = beforeY;
    right.value = beforeX + beforeWidth;
    bottom.value = beforeY + beforeHeight;
    maxed.value = false;
    mined.value = false;
}

let beforeHeight_min = 0;

function minSize() {
    maxed.value = false;
    if (!mined.value) {
        beforeHeight_min = bottom.value - top.value;
        bottom.value = top.value + 28;
        mined.value = true;
    } else {
        bottom.value = top.value + beforeHeight_min;
        mined.value = !mined.value;
    }
}

function close() {
    view.remove(props.panel);
}

function toTop() {
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
</script>

<style lang="less" scoped>
.panel-one {
    user-select: none;
    display: flex;
    flex-direction: column;
    border: 1px solid #888;

    .panel-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        padding: 0 8px 0 12px;
        background-color: #444;
        height: 28px;
    }

    .panel-close {
        cursor: pointer;
    }

    .panel-close:hover {
        color: aqua;
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

.panel-tool:hover,
.panel-tool[actived='true'] {
    color: aqua;
}

.panel-top {
    transform: rotate(180deg);
}
</style>
