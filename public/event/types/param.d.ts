// 编辑器中需要将下面的内容替换掉，来达到更好的类型标注效果
// <<< replace p
type P = Record<string, any>;
// >>> replace p

declare const params: EventParam<P>;

declare const p: P;

type ParamFormatFn = (p: Record<string, any>) => void;

interface EventParam<T> {
    /**
     * 参数值对象
     */
    p: T;

    /**
     * 转换成事件对象
     * @param handlers 转换过程中执行的部分
     * @param $ 是否赋值给`$n`属性
     */
    format(handlers: ParamFormatFn[], $: boolean): any;

    /**
     * 将几个参数包装成一个对象至某个属性上
     * @param list 包装的属性列表
     * @param to 包装到的属性
     */
    wrap(list: (keyof T)[], to: keyof T): this;

    /**
     * 将某个参数转换成一个值
     * @param p 属性
     * @param value 转换成的值
     */
    replace(p: keyof T, value: any): this;
    /**
     * 将部分参数用一个对象替换下来
     * @param obj 要替换的对象
     */
    replace(obj: any): this;

    /**
     * 过滤部分值
     * @param fn 过滤器函数，传入参数的值，返回false表示删除
     * @param p 要过滤的属性，不填视为全部
     */
    filter(fn: (v: any) => boolean, p?: keyof T | (keyof T)[]): this;
    /**
     * 过滤部分值
     * @param value 要过滤掉的值
     * @param p 要过滤的属性，不填视为全部
     */
    filter(value: any, p?: keyof T | (keyof T)[]): this;
}
