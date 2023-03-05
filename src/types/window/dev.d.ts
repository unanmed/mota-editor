interface Dev {
    /**
     * 打开开发者工具
     */
    open(): void;
}

interface Window {
    dev: Dev;
}
