interface SocketHandler {
    getPort(path: string): Promise<number>;
}
