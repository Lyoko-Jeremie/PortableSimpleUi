import 'zone.js';
import {signal as alienSignal, effect as alienEffect, computed as alienComputed} from 'alien-signals';

type AlienSignal<T> = {
    (): T;
    (value: T): void;
};

declare global {
    interface Window {
        PortableSimpleUiRootRender?: () => void;
    }
}

export interface IZoneWrapper {
    readonly zone: Zone;
    readonly rootsToRender: Set<any>;
    readonly triggerRender: () => void;

    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;

    runOutside<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;

    runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;

    registerRoot(root: { renderAll?: () => void; render: () => void }): void;

    runInZone<T>(fn: (...args: any[]) => T): T;

    runInZoneGuarded<T>(fn: (...args: any[]) => T): T;

    runOutZone<T>(fn: (...args: any[]) => T): T;

    wrapInZone<F extends Function>(fn: F, debugName?: string): F;
}

/**
 * 初始化 PortableSimpleUi 的 Zone
 * @param name Zone 的名称
 */
export function createZoneWrapper(name: string): IZoneWrapper {
    if (typeof Zone === 'undefined') {
        throw new Error('zone.js is required but not found. Please import "zone.js" at the entry point.');
    }

    const rootsToRender = new Set<any>();
    const triggerRender = () => {
        rootsToRender.forEach(r => r.renderAll ? r.renderAll() : r.render());
    };

    const zone = Zone.current.fork({
        name,
        onInvoke: (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) => {
            const result = parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
            triggerRender();
            return result;
        },
        onInvokeTask: (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) => {
            const result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
            triggerRender();
            return result;
        },
        onHasTask: (parentZoneDelegate, currentZone, targetZone, hasTask) => {
            if (!hasTask.microTask && !hasTask.macroTask && !hasTask.eventTask) {
                // 当 Zone 中没有任务时，触发当前 Zone 的脏检查
                triggerRender();
            }
            return parentZoneDelegate.hasTask(targetZone, hasTask);
        }
    });

    return {
        zone,
        rootsToRender,
        triggerRender,
        run(fn, applyThis, applyArgs) {
            return zone.run(fn, applyThis, applyArgs);
        },
        runOutside(fn, applyThis, applyArgs) {
            return zone.parent!.run(fn, applyThis, applyArgs);
        },
        runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
            return zone.runGuarded(fn, applyThis, applyArgs);
        },
        registerRoot(root) {
            rootsToRender.add(root);
        },
        runInZone<T>(fn: (...args: any[]) => T): T {
            return zone.run(fn, undefined, []);
        },
        runInZoneGuarded<T>(fn: (...args: any[]) => T): T {
            return zone.runGuarded(fn, undefined, []);
        },
        runOutZone<T>(fn: (...args: any[]) => T): T {
            return zone.parent!.run(fn, undefined, []);
        },
        wrapInZone<F extends Function>(fn: F, debugName?: string): F {
            return zone.wrap<F>(fn, debugName ?? fn.name);
        },
    };
}

/**
 * initPortableSimpleUiZone 是 createZoneWrapper 的别名，用于向后兼容
 */
export const initPortableSimpleUiZone = createZoneWrapper;

/**
 * 包装 signal 以便在组件中使用
 */
export interface ISignal<T> {
    get(): T;

    set(value: T): void;

    readonly value: T;
}

class SignalWrapper<T> implements ISignal<T> {
    private _signal: AlienSignal<T>;

    constructor(initialValue: T) {
        this._signal = alienSignal(initialValue);
    }

    get(): T {
        return this._signal();
    }

    set(value: T): void {
        this._signal(value);
    }

    get value(): T {
        return this._signal();
    }
}

export function signal<T>(initialValue: T): ISignal<T> {
    return new SignalWrapper(initialValue);
}

export {alienEffect as effect, alienComputed as computed};
