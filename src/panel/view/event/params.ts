import { EventEmitter } from '../../../editor/utils/event';
import { MotaEventParam } from './event';

interface ParamEvent {}

type ParamFormatFn = (p: Record<string, any>) => void;

export class EventParams extends EventEmitter<ParamEvent> {
    p: Record<string, any> = {};
    params: MotaEventParam[] = [];

    private formatHandlers: ParamFormatFn[] = [];

    constructor(params?: MotaEventParam[]) {
        super();
        if (params) this.params = params;
        this.p = this.format([], true);
    }

    static from(params: MotaEventParam[]) {
        return new EventParams(params);
    }

    /**
     * 转换成一个对象
     * @param handlers 转换过程中执行的部分
     * @param $ 是否赋值给`$n`属性
     */
    format(
        handlers: ParamFormatFn[] = this.formatHandlers,
        $: boolean = false
    ): any {
        const res: Record<string, any> = {};
        this.params.forEach((v, i) => {
            if (typeof v !== 'string') {
                const value = v._value ?? v.default;
                v._value = value;
                if ($) res[`\$${i}`] = value;
                if (v.key) res[v.key] = value;
            }
        });
        handlers.forEach(v => v(res));
        return res;
    }

    /**
     * 将几个参数包装成一个对象至某个属性上
     * @param list 包装的属性列表
     * @param to 包装到的属性
     */
    wrap(list: string[], to: string): this {
        this.formatHandlers.push(value => {
            value[to] ??= {};
            list.forEach(v => {
                const param = this.params.find((p, i) => {
                    if (typeof p === 'string') return false;
                    return p.key === v || `\$${i}` === v;
                });
                if (!param) {
                    throw new TypeError(
                        `Cannot wrap event param '${v}' to '${to}', since` +
                            `there's no param with a key of '${v}'.`
                    );
                }
                value[to][v] = param._value ?? param.default;
            });
        });
        return this;
    }

    /**
     * 将某个参数转换成一个值
     * @param p 属性
     * @param value 转换成的值
     */
    replace(p: string, value: any): this;
    /**
     * 将部分参数用一个对象替换下来
     * @param obj 要替换的对象
     */
    replace(obj: any): this;
    replace(p: any, value?: any) {
        if (typeof p === 'string') {
            this.formatHandlers.push(v => {
                v[p] = value;
            });
        } else {
            this.formatHandlers.push(v => {
                Object.assign(v, p);
            });
        }
        return this;
    }

    /**
     * 过滤部分值
     * @param fn 过滤器函数，传入参数的值，返回false表示删除
     * @param p 要过滤的属性，不填视为全部
     */
    filter(fn: (v: any) => boolean, p?: string | string[]): this;
    /**
     * 过滤部分值
     * @param value 要过滤掉的值
     * @param p 要过滤的属性，不填视为全部
     */
    filter(value: any, p?: string | string[]): this;
    filter(value: any, p?: string | string[]) {
        const params = (
            p === void 0 || p === null
                ? this.params
                : this.params.filter((v, i) => {
                      if (typeof p === 'string') return v.key === p;
                      else
                          return (
                              p.includes(v.key ?? '') || p.includes(`\$${i}`)
                          );
                  })
        ).map<[string | undefined, string, any]>((v, i) => [
            v.key,
            `\$${i}`,
            v._value
        ]);

        if (typeof value === 'function') {
            this.formatHandlers.push(vv => {
                for (const [key, $, v] of params) {
                    if (!value(v)) {
                        if (key) delete vv[key];
                        delete vv[$];
                    }
                }
            });
        } else {
            this.formatHandlers.push(vv => {
                for (const [key, $, v] of params) {
                    if (value === v) {
                        if (key) delete vv[key];
                        delete vv[$];
                    }
                }
            });
        }

        return this;
    }
}
