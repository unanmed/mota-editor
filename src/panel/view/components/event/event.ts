import { MotaEvent } from '../../event/event';
import { MultiController, MultiItem } from '../multi/multi';

export class EventController extends MultiController<MotaEventItem> {
    add(content: MotaEventItem) {}

    remove(content: MotaEventItem) {}

    close(): void {}
}

export class MotaEventItem extends MultiItem<MotaEvent> {
    private static num: number = 0;

    /** 事件的数字id */
    num = MotaEventItem.num++;
    /** 更新数据，用于v-memo性能优化 */
    updateNum: number = 0;

    save(content?: any): void {}

    update(content: any): void {}
}
