<template>
    <div class="editor-config">
        <span class="editor-desc"
            >这里包含了所有必要的编辑器配置项。这里的配置项是与塔绑定的，并非全局配置项。
            如果需要配置全局配置项，请在编辑器左下角的设置里面配置。
        </span>
        <div class="config-item">
            <caret-right-outlined />
            <span>事件编辑器</span>
            <a-button @click="openEventConfig()">编辑</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { CaretRightOutlined } from '@ant-design/icons-vue';
import { openEventConfig } from '../../control';
</script>

<style lang="less" scoped>
.editor-config {
    font-size: 16px;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.editor-desc {
    padding: 4px 4px 15px 4px;
}

.config-item {
    width: 100%;
    padding: 8px;

    span {
        margin-right: 30px;
    }

    button {
        font-size: 16px;
    }

    border-top: 1px solid #888;
}
</style>
