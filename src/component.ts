import {DynamicValue} from './types';
import {IZoneWrapper} from './core';
import {Observable, Subscription, isObservable} from 'rxjs';

import type {AppRoot, ComponentContainerProxy} from './app-root';

/**
 * 组件样式声明类型。
 *
 * 这里将 `CSSStyleDeclaration` 的所有字段映射为可响应的动态值，
 * 这样调用方既可以直接传入静态值，也可以传入函数、带 `get()` / `value` / `set()` 的响应式对象。
 */
export type StyleDeclaration = {
    [K in keyof CSSStyleDeclaration]?: DynamicValue<CSSStyleDeclaration[K]>;
};

/**
 * 组件基础配置。
 *
 * 说明：
 * - `id`：设置到根元素上的 DOM id。
 * - `style`：组件样式，支持动态值。
 * - `tabTitle`：选项卡标题，通常用于标签页类组件。
 */
export interface IComponentConfig {
    id?: string;
    style?: StyleDeclaration;
    // tabTitle?: DynamicValue<string>;
}

export type ComponentState = Record<string, unknown>;
export type ComponentParent = BaseComponent<IComponentConfig, object>;

/**
 * 所有组件的抽象基类。
 *
 * 负责处理：
 * - 根元素的创建
 * - 基础配置应用
 * - 样式写入
 * - 销毁时从 DOM 中移除
 * - 动态值的读取与写入
 */
export abstract class BaseComponent<
    TConfig extends IComponentConfig = IComponentConfig,
    TState extends object = ComponentState
> {
    /** 组件对应的原生 DOM 元素。 */
    protected element: HTMLElement;
    /** 组件配置对象，保存初始化参数。 */
    public config: TConfig;
    /** 当前组件所处的 Zone 包装器，用于在受控上下文中执行渲染。 */
    public zoneWrapper: IZoneWrapper;
    /** 父组件引用；根组件没有父组件。 */
    private _parentComponent: ComponentParent | null = null;

    /**
     * 获取组件的原生 HTML 元素。
     *
     * 建议尽量通过组件 API 进行交互，只有在需要集成第三方库或底层能力时，
     * 才直接操作该元素。
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * 当前组件的直接父组件。
     *
     * 对于根组件 `AppRoot`，该值为 `null`。
     */
    public get parentComponent(): ComponentParent | null {
        return this._parentComponent;
    }
    /** 组件内部状态容器，供子类按需存放运行时数据。 */
    public state: TState = {} as TState;
    /** 脏标记：当组件需要重新渲染时置为 true。 */
    protected _dirty = false;
    /** 管理所有 RxJS 订阅。 */
    protected _subscriptions = new Subscription();
    /** 缓存 Observable 的最新值。 */
    protected _observableValues = new Map<Observable<any>, any>();

    /**
     * 创建组件实例。
     *
     * 执行顺序：
     * 1. 保存配置与 Zone 包装器
     * 2. 创建根元素
     * 3. 应用基础配置（id、class、style）
     */
    constructor(config: TConfig, zoneWrapper: IZoneWrapper) {
        this.config = config || {} as TConfig;
        this.zoneWrapper = zoneWrapper;
        this.element = this.createHTMLElement();
        this.applyConfig();
    }

    /**
     * 由子类实现，用于创建组件的根 HTML 元素。
     */
    protected abstract createHTMLElement(): HTMLElement;

    /**
     * 设置当前组件的父组件。
     *
     * 该方法主要由框架内部的 `ComponentContainer` 调用，用于维护组件树。
     */
    public setParentComponent(parentComponent: ComponentParent | null): void {
        if (parentComponent === null) {
            this._parentComponent = null;
            return;
        }

        let current: ComponentParent | null = parentComponent;
        while (current) {
            if (current === this) {
                throw new Error('A component cannot be its own ancestor.');
            }
            current = current.parentComponent;
        }

        this._parentComponent = parentComponent;
    }

    /**
     * 获取从直接父组件到根组件的父链。
     */
    public getParentComponents(): ComponentParent[] {
        const parents: ComponentParent[] = [];
        let current = this.parentComponent;

        while (current) {
            parents.push(current);
            current = current.parentComponent;
        }

        return parents;
    }

    /**
     * 获取当前组件所属组件树的根组件。
     */
    public getRootComponent(): ComponentParent {
        let root: ComponentParent = this as ComponentParent;

        while (root.parentComponent) {
            root = root.parentComponent;
        }

        return root;
    }

    /**
     * 获取当前组件所属的 `AppRoot`。
     *
     * 当组件尚未挂载到 `AppRoot` 组件树时返回 `null`。
     */
    public getAppRoot(): AppRoot | null {
        const root = this.getRootComponent();
        return root.isAppRootComponent() ? root as AppRoot : null;
    }

    /**
     * 用于在不引入运行时循环依赖的前提下识别根组件类型。
     */
    protected isAppRootComponent(): boolean {
        return false;
    }

    /**
     * 应用基础配置到根元素上。
     *
     * 包括：
     * - 设置 id
     * - 添加基础类名
     * - 写入初始样式
     */
    protected applyConfig() {
        if (this.config.id) {
            this.element.id = this.config.id;
        }
        // 添加基础类名，便于统一控制组件样式与主题。
        const className = this.getBaseClassName();
        if (className) {
            this.element.classList.add(className);
        }
        this.applyStyle();
    }

    /**
     * 获取组件的基础 CSS 类名。
     *
     * 子类可以重写该方法，返回一个约定好的类名，方便统一样式管理。
     */
    protected getBaseClassName(): string | null {
        return null;
    }

    /**
     * 将配置中的样式应用到元素上。
     *
     * 处理逻辑：
     * - 遍历 `config.style`
     * - 读取动态值的当前结果
     * - 写入到 `element.style`
     */
    protected applyStyle() {
        this.applyStyleToElement(this.element, this.config.style);
    }

    /**
     * 将样式声明应用到指定元素。
     *
     * 子类在需要给内部节点应用样式时可复用该逻辑，保持动态样式解析行为一致。
     */
    protected applyStyleToElement(element: HTMLElement, style?: StyleDeclaration): void {
        if (!style) return;

        for (const key in style) {
            const value = style[key as keyof StyleDeclaration];
            if (value !== undefined) {
                // 这里使用 any 是为了兼容所有 CSS 样式字段的动态写入。
                (element.style as any)[key] = this.resolveValue(value as any);
            }
        }
    }

    /**
     * 标记组件为“脏”，并立即触发一次渲染。
     *
     * 通常在内部状态发生变化时调用。
     */
    public markDirty() {
        this._dirty = true;
        this.render();
    }

    /**
     * 组件渲染入口。
     *
     * 当前基类默认只会重新应用样式，子类可以覆盖此方法实现更复杂的更新逻辑。
     */
    public render(): void {
        this.applyStyle();
    }

    /**
     * 销毁组件。
     *
     * 默认行为是将根元素从其父节点中移除。
     */
    public destroy(): void {
        this._subscriptions.unsubscribe();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        this.setParentComponent(null);
    }

    /**
     * 向动态值写入数据。
     *
     * 支持两种常见形式：
     * - 带 `set()` 方法的响应式对象
     * - 直接暴露 `value` 属性的对象
     */
    protected setValue<T>(accessor: DynamicValue<T>, value: T): void {
        if (accessor && typeof accessor === 'object') {
            if ('set' in accessor && typeof (accessor as any).set === 'function') {
                (accessor as any).set(value);
            } else if ('value' in accessor) {
                (accessor as any).value = value;
            }
        }
    }

    /**
     * 解析动态值为最终可写入的实际值。
     *
     * 支持：
     * - 直接值
     * - 函数返回值
     * - 带 `get()` 方法的对象
     * - 带 `value` 属性的对象
     * - RxJS Observable (自动订阅并触发渲染)
     */
    protected resolveValue<T>(value: DynamicValue<T>): T {
        if (isObservable(value)) {
            if (!this._observableValues.has(value)) {
                // 首次遇到此 Observable，建立订阅
                // 默认使用 undefined 或同步获取的值（如果是 BehaviorSubject）
                let initialValue: any = undefined;
                const sub = value.subscribe(v => {
                    if (this._observableValues.get(value) !== v) {
                        this._observableValues.set(value, v);
                        this.markDirty();
                    }
                });
                this._subscriptions.add(sub);

                // 如果 subscribe 是同步触发的（例如 BehaviorSubject），上面的 set 已经执行。
                // 如果是异步的，或者当前还没有值，Map 中可能还没有记录。
                if (!this._observableValues.has(value)) {
                    this._observableValues.set(value, initialValue);
                }
            }
            return this._observableValues.get(value);
        }
        if (typeof value === 'function') {
            // 如果函数返回的是其他可解析对象，这里直接返回结果，由调用方决定是否继续处理。
            return (value as Function)();
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
 * 支持子组件的容器组件基类。
 *
 * 适用于需要在自身内部再挂载多个子组件的场景，例如：
 * - 布局容器
 * - 面板容器
 * - 选项卡容器
 */
export abstract class ContainerComponent<
    TConfig extends IComponentConfig = IComponentConfig,
    TState extends object = ComponentState
> extends BaseComponent<TConfig, TState> {
    /** 标记该组件属于布局类容器。 */
    public get isLayout(): boolean {
        return true;
    }
    /** 向外暴露的子组件添加代理，通常由框架内部注入。 */
    public add!: ComponentContainerProxy;
    /** 当前组件所在的 Zone 包装器。 */
    public zoneWrapper: IZoneWrapper;
    /** 管理该容器内所有子组件的内部容器。 */
    public _container: ComponentContainer;

    /**
     * 创建容器组件。
     *
     * 在基类初始化完成后，再基于当前组件的子元素宿主创建内部容器管理器。
     */
    constructor(config: TConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        this.zoneWrapper = zoneWrapper;
        this._container = new ComponentContainer(this.getChildrenHost(), zoneWrapper, this);
        // 显式读取一次，保证布局标记在静态检查中被视为已使用。
        void this.isLayout;
    }

    /**
     * 返回存放子组件的宿主元素，默认为组件根元素。
     *
     * 子类可以覆盖此方法，将子组件挂载到 ShadowRoot、指定容器等其他位置。
     */
    protected getChildrenHost(): HTMLElement | ShadowRoot {
        return this.element;
    }

    /**
     * 渲染当前容器及其所有子组件。
     */
    public renderAll(): void {
        this.render();
        this._container.renderAll();
    }

    /**
     * 销毁容器及其子组件。
     */
    public destroy(): void {
        this._container.destroy();
        super.destroy();
    }
}

/**
 * 组件构造器类型。
 *
 * 统一描述“接收配置与 Zone 包装器，并返回具体组件实例”的构造函数签名。
 */
export type ComponentConstructor<T extends BaseComponent<any, any>> = new (config: any, zoneWrapper: IZoneWrapper) => T;

/**
 * 组件容器。
 *
 * 职责：
 * - 创建子组件
 * - 将子组件挂载到宿主节点
 * - 统一调用渲染
 * - 统一销毁管理
 */
export class ComponentContainer {
    /** 容器中已创建并管理的所有组件实例。 */
    public components: BaseComponent<any, any>[] = [];

    /**
     * @param host 子组件挂载宿主，可以是普通 DOM 元素或 ShadowRoot。
     * @param zoneWrapper 用于在 Zone 环境下执行组件渲染。
     */
    constructor(
        private host: HTMLElement | ShadowRoot,
        private zoneWrapper: IZoneWrapper,
        private parentComponent: ComponentParent | null = null
    ) {
    }

    /**
     * 将一个已创建的组件实例添加到容器中。
     */
    public addChild<T extends BaseComponent<any, any>>(component: T): T {
        component.setParentComponent(this.parentComponent);
        this.host.appendChild(component.getElement());
        this.components.push(component);
        this.zoneWrapper.run(() => component.render());
        return component;
    }

    /**
     * 创建并挂载一个子组件。
     *
     * 流程：
     * 1. 实例化组件
     * 2. 将其根元素追加到宿主节点
     * 3. 缓存到容器列表中
     * 4. 在 Zone 中执行一次初始渲染
     */
    public addComponent<T extends BaseComponent<any, any>>(ctor: ComponentConstructor<T>, config: any): T {
        const component = new ctor(config, this.zoneWrapper);
        component.setParentComponent(this.parentComponent);
        const host = this.host instanceof ShadowRoot ? this.host : this.host;
        host.appendChild(component.getElement());
        this.components.push(component);
        // 如果存在 Zone 环境，则在 Zone 中执行渲染，保证响应式上下文一致。
        this.zoneWrapper.run(() => component.render());
        return component;
    }

    /**
     * 渲染容器内的所有组件。
     *
     * 如果组件本身也实现了 `renderAll()`，则会继续向下递归渲染其子树。
     */
    public renderAll() {
        for (const comp of this.components) {
            comp.render();
            if ((comp as any).renderAll) {
                (comp as any).renderAll();
            }
        }
    }

    /**
     * 销毁容器内的所有组件，并清空组件列表。
     */
    public destroy() {
        for (const comp of this.components) {
            comp.destroy();
        }
        this.components = [];
    }
}
