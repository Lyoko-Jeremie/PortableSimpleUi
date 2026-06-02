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

    /**
     * 在父 Zone 中运行，常用于性能优化，避免触发当前 Zone 的渲染钩子
     */
    runOutside<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;

    runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;

    registerRoot(root: { renderAll?: () => void; render: () => void }): void;

    runInZone<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T;

    runInZoneGuarded<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T;

    runOutZone<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T;

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
            try {
                return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
            } finally {
                triggerRender();
            }
        },
        onInvokeTask: (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) => {
            try {
                return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
            } finally {
                triggerRender();
            }
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
            return (zone.parent || zone).run(fn, applyThis, applyArgs);
        },
        runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
            return zone.runGuarded(fn, applyThis, applyArgs);
        },
        registerRoot(root) {
            rootsToRender.add(root);
        },
        runInZone<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T {
            return zone.run(fn, applyThis, applyArgs);
        },
        runInZoneGuarded<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T {
            return zone.runGuarded(fn, applyThis, applyArgs);
        },
        runOutZone<T, A extends any[]>(fn: (...args: A) => T, applyThis?: any, applyArgs?: A): T {
            return (zone.parent || zone).run(fn, applyThis, applyArgs);
        },
        wrapInZone<F extends Function>(fn: F, debugName?: string): F {
            return zone.wrap<F>(fn, debugName ?? fn.name);
        },
    };
}

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

export {alienEffect as effect, alienComputed as computed, createZoneWrapper as initPortableSimpleUiZone};
