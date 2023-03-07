<template>
    <div id="main">
        <Titlebar></Titlebar>
        <Menu></Menu>
    </div>
</template>

<script lang="ts" setup>
import Menu from './panel/title/menu.vue';
import Titlebar from './panel/title/titlebar.vue';
</script>

<style lang="less" scoped>
#main {
    width: 100%;
    height: 100%;
}
</style>
