import path from 'path';

export function includesAll(arr: Array<any>, search: any[]): boolean {
    if (search.length === 0) return arr.includes(search[0]);
    else {
        let matched = 0;
        for (const ele of arr) {
            if (search.includes(ele)) matched++;
        }
        return matched >= search.length;
    }
}

export const queryRE = /\?.*$/s;
export const hashRE = /#.*$/s;

export function cleanUrl(url: string): string {
    return url.replace(hashRE, '').replace(queryRE, '');
}

export function getBufferTypeByExt(file: string) {
    const ext = path.extname(file);
    const buffer = [
        '.mp3',
        '.flac',
        '.ogg',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.ttf',
        '.otf'
    ];
    return buffer.includes(ext) ? void 0 : 'utf-8';
}
