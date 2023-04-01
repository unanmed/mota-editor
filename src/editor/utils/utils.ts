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

/**
 * 拥有重复项检查的Object.assign
 * @param target 分配到的对象
 * @param replace 重复时是否替换目标属性，重复的属性会抛出一个警告
 * @param objs 要分配的对象
 */
export function assignWithCheck(target: any, replace: boolean, ...objs: any[]) {
    const repeat: string[] = [];
    if (typeof target !== 'object' || !target) return;
    objs.forEach(v => {
        if (typeof v !== 'object' || !v) return;
        for (const [key, value] of Object.entries(v)) {
            if (key in v) {
                repeat.push(key);
                if (replace) target[key] = value;
            } else {
                target[key] = value;
            }
        }
    });

    if (repeat.length > 0) {
        console.warn(
            `Repeated properties in assignWithCheck: ${[
                ...new Set(repeat)
            ].join(',')}`
        );
    }

    return target;
}
