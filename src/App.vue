<template>
    <div id="main">
        <Titlebar></Titlebar>
        <Menu></Menu>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { extractKeyCode } from './editor/utils/keycode/extract';
import { KeyCode } from './editor/utils/keycode/keyCodes';
import Menu from './panel/title/menu.vue';
import Titlebar from './panel/title/titlebar.vue';

onMounted(() => {
    // 开发者工具
    if (import.meta.env.DEV) {
        document.addEventListener('keyup', e => {
            const key = extractKeyCode(e);
            if (key === KeyCode.F12) window.dev.open();
        });
    }
});
</script>

<style lang="less" scoped>
#main {
    width: 100%;
    height: 100%;
}
</style>
