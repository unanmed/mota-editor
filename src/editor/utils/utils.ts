export function sleep(time: number) {
    return new Promise(res => setTimeout(res, time));
}

export function parseDoc(content: string[]) {
    return content.join('');
}
