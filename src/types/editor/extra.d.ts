interface ExtraHandler {
    get(path: string): Promise<Uint8Array>;
    get(path: string, encoding: BufferEncoding): Promise<string>;

    readl(dir: string, defaults?: string): Promise<[string, Uint8Array][]>;
    readl(
        dir: string,
        defaults?: string,
        encoding: BufferEncoding
    ): Promise<[string, string][]>;
}
