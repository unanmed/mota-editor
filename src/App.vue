<template>
    <div id="title">
        <Titlebar></Titlebar>
        <Menu></Menu>
    </div>
    <div id="main"></div>
</template>

<script lang="ts" setup>
import Menu from './panel/title/menu.vue';
import Titlebar from './panel/title/titlebar.vue';
</script>

<style lang="less" scoped>
#title {
    width: 100%;
    height: 42px;
}

#main {
    width: 100%;
    height: calc(100% - 42px);
}
</style>
