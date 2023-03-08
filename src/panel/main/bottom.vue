<template>
    <div id="bottombar">
        <div id="left">
            <span>未登录</span>
            <span>项目：{{ projectInfo.name.value }}</span>
            <span>{{ projectInfo.title.value }}</span>
        </div>
        <div id="right">
            <bell-outlined />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { BellOutlined } from '@ant-design/icons-vue';
import { projectInfo } from '../../editor/project/project';
</script>

<style lang="less" scoped>
#bottombar {
    height: 30px;
    background-color: rgb(0, 122, 204);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    padding: 0 12px;
    overflow: hidden;

    div {
        user-select: none;

        span {
            cursor: pointer;
            padding: 4px 8px;
            transition: all 0.1s linear;
        }

        span:hover {
            background-color: #fff3;
            border-radius: 4px;
        }
    }
}
</style>
