import { Ref, shallowReactive } from 'vue';

interface MenuData {
    text: string;
    fn: () => void;
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
        }
    },
    'divider',
    ...(await window.editor.project.getRecent()).map(v => {
        return {
            text: v,
            fn: () => {
                console.log(20);
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
        }
    },
    {
        text: '打开项目',
        shortcut: 'Ctrl + O',
        fn: () => {
            console.log(2);
        }
    },
    {
        text: '打开最近的项目',
        fn: () => {
            console.log(5);
        },
        child: recentMenu
    },
    'divider',
    {
        text: '保存',
        shortcut: 'Ctrl + S',
        fn: () => {
            console.log(3);
        }
    },
    {
        text: '全部保存',
        shortcut: 'Ctrl + Alt + S',
        fn: () => {
            console.log(4);
        }
    },
    'divider',
    {
        text: '关闭项目',
        shortcut: 'Ctrl + F4',
        fn: () => {
            console.log(6);
        }
    },
    {
        text: '关闭所有项目',
        shortcut: 'Ctrl + Alt + F4',
        fn: () => {
            console.log(8);
        }
    },
    {
        text: '关闭当前编辑器',
        shortcut: 'Alt + F4',
        fn: () => {
            console.log(9);
        }
    },
    'divider',
    {
        text: '退出',
        fn: () => {
            console.log(10);
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
        }
    },
    {
        text: '恢复',
        shortcut: 'Ctrl + Y',
        fn: () => {
            console.log(12);
        }
    },
    'divider',
    {
        text: '剪切',
        shortcut: 'Ctrl + X',
        fn: () => {
            console.log(13);
        }
    },
    {
        text: '复制',
        shortcut: 'Ctrl + C',
        fn: () => {
            console.log(14);
        }
    },
    {
        text: '粘贴',
        shortcut: 'Ctrl + V',
        fn: () => {
            console.log(15);
        }
    }
]);
editMenu.setPos(104, 40);
editMenu.width = 300;

export const gameMenu = new Menu([
    {
        text: '进入游戏',
        shortcut: 'Ctrl + E',
        fn: () => {
            console.log(16);
        }
    },
    {
        text: '在新窗口进入游戏',
        shortcut: 'Ctrl + Shift + E',
        fn: () => {
            console.log(18);
        }
    },
    {
        text: '关闭当前游戏',
        shortcut: 'Ctrl + Alt + E',
        fn: () => {
            console.log(19);
        }
    }
]);
gameMenu.setPos(160, 40);
gameMenu.width = 350;

export const menuDict = {
    file: fileMenu,
    edit: editMenu,
    game: gameMenu
};

export const menus = new MenuController();
