<template>
    <PanelView
        class="view-one"
        v-for="panel of view.list"
        :type="panel.type"
        :p="panel.props"
        :name="panel.name"
        :panel="panel"
        :key="panel.num"
    ></PanelView>
</template>

<script lang="ts" setup>
import { view } from './control';
import PanelView from './panelView.vue';
</script>

<style lang="less" scoped>
.view-one {
    position: absolute;
}
</style>
