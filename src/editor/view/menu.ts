import { reactive, Ref, shallowReactive } from 'vue';

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

export const recentMenu = new Menu([]);

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
    }
]);
fileMenu.setPos(48, 40);
fileMenu.width = 300;

export const editMenu = new Menu([]);

export const gameMenu = new Menu([]);

export const menuDict = {
    file: fileMenu,
    edit: editMenu,
    game: gameMenu
};

export const menus = new MenuController();
