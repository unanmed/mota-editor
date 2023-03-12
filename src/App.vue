<template>
    <div id="title">
        <Titlebar></Titlebar>
        <Menu></Menu>
    </div>
    <div id="main">
        <div id="main-top">
            <div id="main-side">
                <Side></Side>
            </div>
            <div id="main-content" @mousedown="blur">
                <EditorView></EditorView>
                <Empty></Empty>
            </div>
        </div>
        <div id="main-bottom">
            <Bottom></Bottom>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { sidebar, bottombar } from './editor/view/control';
import Side from './panel/main/side.vue';
import Bottom from './panel/main/bottom.vue';
import Menu from './panel/title/menu.vue';
import Titlebar from './panel/title/titlebar.vue';
import Empty from './panel/main/empty.vue';
import { view } from './editor/view/control';
import EditorView from './editor/view/editorView.vue';
import { extractKeyCode } from './editor/utils/keycode/extract';
import { KeyCode } from './editor/utils/keycode/keyCodes';

let side: HTMLDivElement;
let bottom: HTMLDivElement;

function blur() {
    view.list.forEach(v => {
        v.focused.value = false;
    });
}

onMounted(() => {
    side = document.getElementById('main-side') as HTMLDivElement;
    bottom = document.getElementById('main-bottom') as HTMLDivElement;

    watch(
        sidebar,
        n => {
            if (n) side.style.width = '60px';
            else side.style.width = '0';
        },
        { immediate: true }
    );
    watch(
        bottombar,
        n => {
            if (n) bottom.style.height = '30px';
            else bottom.style.height = '0';
        },
        { immediate: true }
    );

    if (!import.meta.env.DEV) {
        document.addEventListener('keydown', e => {
            const c = extractKeyCode(e);
            if (c === KeyCode.KeyR && e.ctrlKey) {
                e.preventDefault();
            }
        });
    }
});
</script>

<style lang="less" scoped>
#title {
    width: 100%;
    height: 42px;
}

#main {
    width: 100%;
    height: calc(100% - 42px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

#main-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #222;
    position: relative;
}

#main-top {
    width: 100%;
    height: 100%;
    display: flex;
}

#main-side {
    height: 100%;
}

#main-bottom {
    width: 100%;
}
</style>
