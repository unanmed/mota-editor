/**
 * 深度只读一个对象，使其所有属性都只读
 */
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends number | string | boolean
        ? T[P]
        : DeepReadonly<T[P]>;
};

/**
 * 深度可选一个对象，使其所有属性都可选
 */
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends number | string | boolean | Array<any>
        ? T[P]
        : DeepPartial<T[P]>;
};

/**
 * 深度必选一个对象，使其所有属性都必选
 */
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends number | string | boolean
        ? T[P]
        : DeepRequired<T[P]>;
};

/**
 * 使一个对象的所有属性可写
 */
type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};

/**
 * 深度可写一个对象，使其所有属性都可写
 */
type DeepWritable<T> = {
    -readonly [P in keyof T]: T[P] extends number | string | boolean
        ? T[P]
        : DeepWritable<T[P]>;
};

/**
 * 从一个对象中选择类型是目标类型的属性
 */
type SelectType<R, T> = {
    [P in keyof R as R[P] extends T ? P : never]: R[P];
};

/**
 * 从一个对象中选择类型是目标属性的键名
 */
type SelectKey<R, T> = keyof SelectType<R, T>;

/**
 * 获取一段字符串的第一个字符
 */
type FirstCharOf<T extends string> = T extends `${infer F}${infer A}`
    ? F
    : never;

/**
 * 非对象属性
 */
type NonObject = number | string | boolean;

/**
 * 获取一个对象的非对象值
 */
type NonObjectOf<T> = SelectType<T, NonObject>;

/**
 * 以一个字符串结尾
 */
type EndsWith<T extends string> = `${string}${T}`;

type KeyExcludesUnderline<T> = Exclude<keyof T, `_${string}`>;

type ValueOf<T> = T[keyof T];
