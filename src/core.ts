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

/**
 * 初始化 PortableSimpleUi 的 Zone
 * @param name Zone 的名称
 */
export function initPortableSimpleUiZone(name: string): Zone {
    if (typeof Zone === 'undefined') {
        throw new Error('zone.js is required but not found. Please import "zone.js" at the entry point.');
    }
    const zone = Zone.current.fork({
        name,
        onInvoke: (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) => {
            const result = parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
            window.PortableSimpleUiRootRender?.();
            return result;
        },
        onInvokeTask: (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) => {
            const result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
            window.PortableSimpleUiRootRender?.();
            return result;
        },
        onHasTask: (parentZoneDelegate, currentZone, targetZone, hasTask) => {
            if (!hasTask.microTask && !hasTask.macroTask && !hasTask.eventTask) {
                // 当 Zone 中没有任务时，触发全局脏检查
                window.PortableSimpleUiRootRender?.();
            }
            return parentZoneDelegate.hasTask(targetZone, hasTask);
        }
    });
    (window as any).PortableSimpleUiZone = zone;
    return zone;
}

/**
 * 全局渲染列表，用于 Zone 完成任务后的自动更新
 */
const rootsToRender = new Set<any>();

export function registerRootForAutoRender(root: any) {
    rootsToRender.add(root);
    window.PortableSimpleUiRootRender = () => {
        rootsToRender.forEach(r => r.renderAll ? r.renderAll() : r.render());
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

export {alienEffect as effect, alienComputed as computed};
