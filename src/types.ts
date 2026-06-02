export type DynamicValue<T> = T | (() => T) | { value: T };
