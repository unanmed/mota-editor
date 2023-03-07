<template>
    <div id="title-bar">
        <div id="title-left">
            <img class="title-item" id="icon" src="/favicon.ico" />
            <span
                class="title-item"
                v-for="(name, key) of toolList"
                @click.stop="select(key)"
                >{{ name }}</span
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Menu, menuDict, menus } from '../../editor/view/menu';

const toolList = {
    file: '项目',
    edit: '编辑',
    game: '游戏',
    other: '其他'
};

let showed: boolean = false;
let now: Menu | null;

function select(key: keyof typeof toolList) {
    const menu = menuDict[key];
    if (showed && now !== menu) menus.clear();
    menus.trigger(menu);
    menu.once('unmount', () => (showed = false));
    showed = true;
    now = menu;
}

onMounted(() => {
    document.addEventListener('click', () => {
        menus.clear();
        showed = false;
        now = null;
    });
});
</script>

<style lang="less" scoped>
#title-bar {
    width: 100%;
    height: 42px;
    background-color: #444;
    -webkit-app-region: drag;
    user-select: none;
    display: flex;
    justify-content: space-between;
    padding: 8px 0;

    * {
        -webkit-app-region: no-drag;
    }
}

#icon {
    width: 48px;
    height: 24px;
    pointer-events: none;
}

#title-left {
    display: flex;
}

.title-item {
    padding: 0 12px 0 12px;
    font-size: 16px;
    transition: all 0.2s linear;
}

.title-item:hover {
    background-color: #666;
    border-radius: 6px;
}

.title-item:active {
    background-color: #555;
    border-radius: 6px;
}
</style>
