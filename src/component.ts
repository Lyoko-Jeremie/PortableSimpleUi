import {DynamicValue} from './types';
import {IZoneWrapper} from './core';

export type StyleDeclaration = {
    [K in keyof CSSStyleDeclaration]?: DynamicValue<CSSStyleDeclaration[K]>;
};

export interface IComponentConfig {
    id?: string;
    style?: StyleDeclaration;
    tabTitle?: DynamicValue<string>;
}

export abstract class BaseComponent<TConfig extends IComponentConfig = IComponentConfig> {
    protected element: HTMLElement;
    public config: TConfig;
    public zoneWrapper: IZoneWrapper;

    /**
     * 获取组件的原生 HTML 元素。
     * 尽量避免直接操作原生元素，除非必要（如集成第三方库）。
     */
    public getElement(): HTMLElement {
        return this.element;
    }
    public state: any = {};
    protected _dirty = false;

    constructor(config: TConfig, zoneWrapper: IZoneWrapper) {
        this.config = config || {} as TConfig;
        this.zoneWrapper = zoneWrapper;
        this.element = this.createHTMLElement();
        this.applyConfig();
    }

    protected abstract createHTMLElement(): HTMLElement;

    protected applyConfig() {
        if (this.config.id) {
            this.element.id = this.config.id;
        }
        // 添加基础类名
        const className = this.getBaseClassName();
        if (className) {
            this.element.classList.add(className);
        }
        this.applyStyle();
    }

    /**
     * 获取组件的基础 CSS 类名
     */
    protected getBaseClassName(): string | null {
        return null;
    }

    protected applyStyle() {
        if (this.config.style) {
            for (const key in this.config.style) {
                const value = this.config.style[key as keyof StyleDeclaration];
                if (value !== undefined) {
                    (this.element.style as any)[key] = this.resolveValue(value as any);
                }
            }
        }
    }

    public markDirty() {
        this._dirty = true;
        this.render();
    }

    public render(): void {
        this.applyStyle();
    }

    public destroy(): void {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }

    protected setValue<T>(accessor: DynamicValue<T>, value: T): void {
        if (accessor && typeof accessor === 'object') {
            if ('set' in accessor && typeof (accessor as any).set === 'function') {
                (accessor as any).set(value);
            }
        }
    }

    protected resolveValue<T>(value: DynamicValue<T>): T {
        if (typeof value === 'function') {
            const result = (value as Function)();
            // 如果函数返回的还是个带有 get() 的对象（虽然不常见，但为了兼容性），继续递归一层或直接返回
            return result;
        }
        if (value && typeof value === 'object') {
            if ('get' in value && typeof (value as any).get === 'function') {
                return (value as any).get();
            }
            if ('value' in value) {
                return (value as any).value;
            }
        }
        return value as T;
    }
}

/**
 * 支持子组件的容器组件基类
 */
export abstract class ContainerComponent<TConfig extends IComponentConfig = IComponentConfig> extends BaseComponent<TConfig> {
    public isLayout = true;
    public add: any;
    public zoneWrapper: IZoneWrapper;
    public _container: ComponentContainer;

    constructor(config: TConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        this.zoneWrapper = zoneWrapper;
        this._container = new ComponentContainer(this.getChildrenHost(), zoneWrapper);
    }

    /**
     * 返回存放子组件的 HTML 元素，默认为组件根元素
     */
    protected getChildrenHost(): HTMLElement | ShadowRoot {
        return this.element;
    }

    public renderAll(): void {
        this.render();
        this._container.renderAll();
    }

    public destroy(): void {
        this._container.destroy();
        super.destroy();
    }
}

export type ComponentConstructor<T extends BaseComponent<any>> = new (config: any, zoneWrapper: IZoneWrapper) => T;

export class ComponentContainer {
    public components: BaseComponent<any>[] = [];

    constructor(private host: HTMLElement | ShadowRoot, private zoneWrapper: IZoneWrapper) {
    }

    public addComponent<T extends BaseComponent<any>>(ctor: ComponentConstructor<T>, config: any): T {
        const component = new ctor(config, this.zoneWrapper);
        const host = this.host instanceof ShadowRoot ? this.host : this.host;
        host.appendChild(component.getElement());
        this.components.push(component);
        // 如果有 Zone，可以在 Zone 中执行渲染逻辑
        this.zoneWrapper.run(() => component.render());
        return component;
    }

    public renderAll() {
        for (const comp of this.components) {
            comp.render();
            if ((comp as any).renderAll) {
                (comp as any).renderAll();
            }
        }
    }

    public destroy() {
        for (const comp of this.components) {
            comp.destroy();
        }
        this.components = [];
    }
}
