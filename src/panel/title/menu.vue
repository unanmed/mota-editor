<template>
    <div
        class="menus"
        v-for="menu of menus.list"
        :style="{
            left: `${menu.x}px`,
            top: `${menu.y}px`,
            width: `${menu.width}px`
        }"
        @mouseenter="menu.enter ? menu.enter() : () => {}"
        @mouseleave="menu.leave ? menu.leave() : () => {}"
    >
        <div v-for="one of menu.data" @click.stop="">
            <a-divider
                class="divider"
                v-if="typeof one === 'string'"
            ></a-divider>
            <div class="menu-one" v-else-if="!one.child" @click="one.fn()">
                <span>{{ one.text }}</span>
                <span v-if="one.shortcut">{{ one.shortcut }}</span>
            </div>
            <div
                class="menu-one"
                v-else
                @mouseenter="showChildMenu($event, one.child!)"
                @mouseleave="closeChildMenu($event, one.child!)"
            >
                <span>{{ one.text }}</span>
                <right-outlined class="menu-more" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { menus, Menu } from '../../editor/view/menu';
import { RightOutlined } from '@ant-design/icons-vue';
import { debounce } from 'lodash';

const showChild = debounce((ev: MouseEvent, menu: Menu) => {
    closeChild.flush();
    const ele = ev.target as HTMLElement;
    const rect = ele.getBoundingClientRect();
    const right = rect.right + 6;
    const top = rect.top - 6.5;
    menu.setPos(right, top);
    menu.hover(closeChild.cancel, () => {
        closeChild(ev, menu);
    });
    menus.add(menu);
}, 200);

const closeChild = debounce((ev: MouseEvent, menu: Menu) => {
    menus.remove(menu);
}, 500);

function showChildMenu(ev: MouseEvent, menu: Menu) {
    showChild(ev, menu);
}

function closeChildMenu(ev: MouseEvent, menu: Menu) {
    showChild.cancel();
    closeChild(ev, menu);
}
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
    align-items: center;
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
    font-size: 14px;
}
</style>
