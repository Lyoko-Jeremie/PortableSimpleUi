export type DynamicValue<T> = T | (() => T) | { value: T } | { get(): T };
