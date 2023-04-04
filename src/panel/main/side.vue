<template>
    <div id="sidebar">
        <div id="top">
            <unordered-list-outlined class="panel-icon" @click="addData" />
            <picture-outlined class="panel-icon" />
            <code-outlined class="panel-icon" />
            <file-add-outlined class="panel-icon" />
            <project-outlined class="panel-icon" />
            <gateway-outlined class="panel-icon" />
            <partition-outlined class="panel-icon" @click="openConfig" />
        </div>
        <div id="bottom">
            <user-outlined class="panel-icon" />
            <setting-outlined class="panel-icon" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    UnorderedListOutlined,
    PictureOutlined,
    CodeOutlined,
    FileAddOutlined,
    ProjectOutlined,
    GatewayOutlined,
    UserOutlined,
    SettingOutlined,
    PartitionOutlined
} from '@ant-design/icons-vue';
import { addData, openConfig } from '../view/control';
</script>

<style lang="less" scoped>
#sidebar {
    width: 60px;
    background-color: #333;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    font-size: 28px;
}

.panel-icon {
    padding: 12px 16px 12px 12px;
    border-left: 4px solid transparent;
    color: #aaa;
    cursor: pointer;
    transition: all 0.1s linear;
}

.panel-icon:hover {
    border-left: 4px solid rgb(0, 122, 204);
    color: #fff;
}
</style>
