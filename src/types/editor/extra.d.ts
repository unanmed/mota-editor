interface ExtraHandler {
    get(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
}
