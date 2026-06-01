/**
 * 获取对象 T 在路径 P 上的类型
 */
export type ValueOfDotPathTo<T, P extends string> =
    P extends `${infer Key}.${infer Rest}`
        ? Key extends keyof T
            ? ValueOfDotPathTo<T[Key], Rest>
            : any
        : P extends keyof T
            ? T[P]
            : any;

/**
 * 获取对象 T 的所有可能的点分隔路径
 */
export type DotPathOf<T> = T extends object
    ? {
        [K in keyof T]: K extends string
            ? T[K] extends any[]
                ? K | `${K}.${DotPathOf<T[K]>}`
                : T[K] extends object
                    ? K | `${K}.${DotPathOf<T[K]>}`
                    : K
            : never
    }[keyof T]
    : never;

/**
 * 内部用于根据路径获取值
 */
function getValueByPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
}

/**
 * makeRef 实现
 */
export function makeRef<T, P extends string = DotPathOf<T>, R = any>(
    context: T,
    path: P & (P extends DotPathOf<T> ? P : never),
    formatter?: (value: ValueOfDotPathTo<T, P>) => R
): () => R {
    return () => {
        const val = getValueByPath(context, path);
        return formatter ? formatter(val) : val;
    };
}
