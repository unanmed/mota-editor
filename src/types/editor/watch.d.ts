interface WatchEvent {
    mainDataChange: (data: string) => void;
}

interface WatchHandler {
    on<K extends keyof WatchEvent>(type: K, fn: WatchEvent[K]): void;
}
