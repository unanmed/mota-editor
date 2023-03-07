<template>
    <div
        class="menus"
        v-for="menu of menus.list"
        :style="{
            left: `${menu.x}px`,
            top: `${menu.y}px`,
            width: `${menu.width}px`
        }"
    >
        <div v-for="one of menu.data">
            <a-divider
                class="divider"
                v-if="typeof one === 'string'"
            ></a-divider>
            <div class="menu-one" v-else-if="!one.child" @click.stop="one.fn()">
                <span>{{ one.text }}</span>
                <span v-if="one.shortcut">{{ one.shortcut }}</span>
            </div>
            <div
                class="menu-one"
                v-else
                @mouseenter="showChildMenu(one.child!)"
            >
                <span>{{ one.text }}</span>
                <right-outlined class="menu-more" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { menus, Menu } from '../../editor/view/menu';
import { RightOutlined } from '@ant-design/icons-vue';

function showChildMenu(menu: Menu) {}

function closeChildMenu(menu: Menu) {}
</script>

<style lang="less" scoped>
.menus {
    position: fixed;
    display: flex;
    flex-direction: column;
    padding: 3px 0 3px 0;
    border: #666 solid 1px;
    border-radius: 3px;
    background-color: #333;
    max-height: 90vh;
    overflow: auto;
}

.menu-one {
    display: flex;
    margin: 3px 6px;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 16px;
    border-radius: 4px;
    user-select: none;
    cursor: pointer;
    transition: all 0.1s linear;
}

.divider {
    border-color: #666;
    margin: 3px 0 3px 0;
}

.menu-one:hover {
    background-color: rgb(4, 57, 94);
}

.menu-one:active {
    background-color: rgb(7, 71, 118);
}

.menu-more {
    transform: translateX(15px);
}
</style>
