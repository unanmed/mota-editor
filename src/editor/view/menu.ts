import { Ref, shallowReactive } from 'vue';
import { selectProject } from '../project/open';

interface MenuData {
    text: string;
    fn: () => boolean;
    shortcut?: string;
    divide?: boolean;
    child?: Menu;
    available?: Ref<boolean>;
}

interface MenuEvent {
    fn: () => void;
    once?: boolean;
    disposed?: boolean;
}

type MenuEventType = 'mount' | 'unmount';

export class Menu {
    data: (MenuData | 'divider')[] = [];
    x: number = 0;
    y: number = 0;
    width: number = 200;

    enter?: () => void;
    leave?: () => void;

    private events: Partial<Record<MenuEventType, MenuEvent[]>> = {};

    constructor(data?: (MenuData | 'divider')[]) {
        if (data) this.data = data;
    }

    /**
     * 添加一个菜单数据
     * @param data 菜单数据
     */
    add(data: MenuData | 'divider') {
        this.data.push(data);
    }

    /**
     * 设置菜单数据
     * @param data 菜单数据列表
     */
    set(data: (MenuData | 'divider')[]) {
        this.data = data;
    }

    /**
     * 设置菜单的位置
     * @param x 横坐标
     * @param y 纵坐标
     */
    setPos(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * 设置当鼠标在元素上时的效果
     * @param enter 鼠标进入时
     * @param leave 鼠标离开时
     */
    hover(enter: () => void, leave: () => void) {
        this.enter = enter;
        this.leave = leave;
    }

    /**
     * 监听事件，同时只执行一次
     * @param e 事件类型
     * @param fn 执行的函数
     */
    once(e: MenuEventType, fn: () => void) {
        this.events[e] ??= [];
        this.events[e]!.push({
            once: true,
            fn,
            disposed: false
        });
    }

    /**
     * 执行监听事件
     * @param e 事件类型
     */
    dispose(e: MenuEventType) {
        if (!this.events[e]) return;
        for (const ee of this.events[e]!) {
            ee.fn();
            if (ee.once) ee.disposed = true;
        }
        this.events[e] = this.events[e]!.filter(v => !v.disposed);
    }
}

export class MenuController {
    list: Menu[] = shallowReactive([]);

    /**
     * 显示一个菜单
     * @param menu 菜单
     */
    add(menu: Menu) {
        if (this.list.includes(menu)) return;
        this.list.push(menu);
        menu.dispose('mount');
    }

    /**
     * 移除一个菜单
     * @param menu 菜单
     */
    remove(menu: Menu) {
        const index = this.list.indexOf(menu);
        if (index === -1) return;
        this.list.splice(index);
        menu.dispose('unmount');
    }

    /**
     * 清空菜单列表
     */
    clear() {
        const list = this.list.splice(0);
        list.forEach(v => v.dispose('unmount'));
    }

    /**
     * 如果开启了一个菜单，则关闭，否则打开
     * @param menu 菜单
     */
    trigger(menu: Menu) {
        const index = this.list.indexOf(menu);
        if (index === -1) {
            this.list.push(menu);
            menu.dispose('mount');
        } else {
            this.list.splice(index, 1);
            menu.dispose('unmount');
        }
    }
}

export const recentMenu = new Menu([
    {
        text: '打开全部',
        shortcut: 'Ctrl + Alt + A',
        fn: () => {
            console.log(7);
            return true;
        }
    },
    'divider',
    ...(await window.editor.project.getRecent()).map(v => {
        return {
            text: v,
            fn: () => {
                console.log(20);
                return true;
            }
        };
    })
]);
recentMenu.width = 300;

export const fileMenu = new Menu([
    {
        text: '新建项目',
        shortcut: 'Ctrl + Alt + N',
        fn: () => {
            console.log(1);
            return true;
        }
    },
    {
        text: '新建窗口',
        shortcut: 'Ctrl + Shift + N',
        fn: () => {
            console.log(30);
            return true;
        }
    },
    'divider',
    {
        text: '打开项目',
        shortcut: 'Ctrl + O',
        fn: () => {
            selectProject();
            return true;
        }
    },
    {
        text: '从文件夹打开',
        fn: () => {
            console.log(32);
            return true;
        }
    },
    {
        text: '打开在线工程',
        shortcut: 'Ctrl + Shift + O',
        fn: () => {
            console.log(28);
            return true;
        }
    },
    {
        text: '在新窗口打开',
        fn: () => {
            console.log(31);
            return true;
        }
    },
    {
        text: '打开最近的项目',
        fn: () => {
            console.log(5);
            return false;
        },
        child: recentMenu
    },
    'divider',
    {
        text: '保存',
        shortcut: 'Ctrl + S',
        fn: () => {
            console.log(3);
            return true;
        }
    },
    {
        text: '全部保存',
        shortcut: 'Ctrl + Alt + S',
        fn: () => {
            console.log(4);
            return true;
        }
    },
    'divider',
    {
        text: '关闭项目',
        shortcut: 'Ctrl + F4',
        fn: () => {
            console.log(6);
            return true;
        }
    },
    {
        text: '关闭所有项目',
        shortcut: 'Ctrl + Alt + F4',
        fn: () => {
            console.log(8);
            return true;
        }
    },
    {
        text: '关闭当前编辑器',
        shortcut: 'Alt + F4',
        fn: () => {
            console.log(9);
            return true;
        }
    },
    'divider',
    {
        text: '退出',
        fn: () => {
            console.log(10);
            return true;
        }
    }
]);
fileMenu.setPos(48, 40);
fileMenu.width = 300;

export const editMenu = new Menu([
    {
        text: '撤销',
        shortcut: 'Ctrl + Z',
        fn: () => {
            console.log(11);
            return true;
        }
    },
    {
        text: '恢复',
        shortcut: 'Ctrl + Y',
        fn: () => {
            console.log(12);
            return true;
        }
    },
    'divider',
    {
        text: '剪切',
        shortcut: 'Ctrl + X',
        fn: () => {
            console.log(13);
            return true;
        }
    },
    {
        text: '复制',
        shortcut: 'Ctrl + C',
        fn: () => {
            console.log(14);
            return true;
        }
    },
    {
        text: '粘贴',
        shortcut: 'Ctrl + V',
        fn: () => {
            console.log(15);
            return true;
        }
    }
]);
editMenu.setPos(104, 40);
editMenu.width = 250;

export const gameMenu = new Menu([
    {
        text: '进入游戏',
        shortcut: 'Ctrl + E',
        fn: () => {
            console.log(16);
            return true;
        }
    },
    {
        text: '在新窗口进入游戏',
        shortcut: 'Ctrl + Shift + E',
        fn: () => {
            console.log(18);
            return true;
        }
    },
    {
        text: '关闭当前游戏',
        shortcut: 'Ctrl + Alt + E',
        fn: () => {
            console.log(19);
            return true;
        }
    },
    {
        text: '重新加载当前游戏',
        shortcut: 'Ctrl + Alt + R',
        fn: () => {
            console.log(28);
            return true;
        }
    },
    'divider',
    {
        text: '打包当前游戏',
        fn: () => {
            console.log(21);
            return true;
        }
    },
    {
        text: '发布自助更新',
        fn: () => {
            console.log(22);
            return true;
        }
    }
]);
gameMenu.setPos(160, 40);
gameMenu.width = 350;

export const otherMenu = new Menu([
    {
        text: '打开插件库',
        fn: () => {
            console.log(23);
            return true;
        }
    },
    {
        text: '打开素材库',
        fn: () => {
            console.log(24);
            return true;
        }
    }
]);
otherMenu.setPos(216, 40);

export const helpMenu = new Menu([
    {
        text: '使用说明',
        fn: () => {
            console.log(25);
            return true;
        }
    },
    {
        text: '获取帮助',
        fn: () => {
            console.log(27);
            return true;
        }
    },
    'divider',
    {
        text: '检查更新',
        fn: () => {
            console.log(26);
            return true;
        }
    }
]);
helpMenu.setPos(272, 40);

export const menuDict = {
    file: fileMenu,
    edit: editMenu,
    game: gameMenu,
    other: otherMenu,
    help: helpMenu
};

export const menus = new MenuController();
