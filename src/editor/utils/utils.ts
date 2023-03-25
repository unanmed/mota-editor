export function sleep(time: number) {
    return new Promise(res => setTimeout(res, time));
}

export function parseDoc(content: string[]) {
    return content.join('');
}

export function spliceElement<T>(arr: T[], ele: T): T[] {
    const index = arr.indexOf(ele);
    if (index === -1) return [];
    else return arr.splice(index, 1);
}
