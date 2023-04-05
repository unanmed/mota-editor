export class EventEmitter<Event> {
    event: {
        [P in keyof Event]?: Event[P][];
    } = {};

    on<K extends keyof Event>(type: K, fn: Event[K]) {
        this.event[type] ??= [];
        this.event[type]!.push(fn);
    }

    off<K extends keyof Event>(type: K, fn: Event[K] | 'all'): void;
    off(type: 'all'): void;
    off(type: string, fn?: any) {
        if (type === 'all') this.event = {};
        else {
            if (fn === 'all') {
                this.event[type as keyof Event] = [];
                return;
            }
            const e = this.event[type as keyof Event];
            if (!e) return;
            const index = e.indexOf(fn);
            if (index === -1) return;
            e.splice(index, 1);
        }
    }

    emit(type: keyof Event, ...params: any[]) {
        return this.event[type]?.map(v => (v as Function)(...params));
    }
}
