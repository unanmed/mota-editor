interface ExtraHandler {
    get(path: string): Promise<Buffer>;
    get(path: string, encoding: BufferEncoding): Promise<string>;
}
