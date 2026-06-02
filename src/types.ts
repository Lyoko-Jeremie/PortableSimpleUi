export interface DataAccessor<T> {
    get(): T;
    set(value: T): void;
}

export type DynamicValue<T> = T | (() => T) | { value: T } | { get(): T } | DataAccessor<T>;
