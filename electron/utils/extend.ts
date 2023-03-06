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
