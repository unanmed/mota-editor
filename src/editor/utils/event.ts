export class EventEmitter<Event> {
    event: {
        [P in keyof Event]?: Event[P][];
    } = {};

    on<K extends keyof Event>(type: K, fn: Event[K]) {
        this.event[type] ??= [];
        this.event[type]!.push(fn);
    }

    off<K extends keyof Event>(type: K, fn: Event[K]): void;
    off(type: 'all'): void;
    off(type: string, fn?: any) {
        if (type === 'all') this.event = {};
        else {
            const e = this.event[type as keyof Event];
            if (!e) return;
            const index = e.indexOf(fn);
            if (index === -1) return;
            e.splice(index, 1);
        }
    }

    emit(type: keyof Event, ...params: any[]) {
        this.event[type]?.forEach(v => (v as Function)(...params));
    }
}
