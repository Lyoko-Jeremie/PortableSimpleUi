import {BaseComponent, IComponentConfig, ComponentContainer, ComponentConstructor} from './component';
import {registerRootForAutoRender} from './core';

export interface IAppRootConfig extends IComponentConfig {
    styleIsolation?: {
        mode: 'shadow' | 'none';
        styles?: string;
    };
}

export class AppRoot extends BaseComponent<IAppRootConfig> {
    public host: HTMLElement;
    public root: HTMLElement | ShadowRoot;
    public add: ComponentContainerProxy;
    private _container: ComponentContainer;

    constructor(parentElement: HTMLElement, config: IAppRootConfig) {
        super(config);
        this.host = this.element;

        if (config.styleIsolation?.mode === 'shadow') {
            this.root = this.host.attachShadow({mode: 'open'});
            if (config.styleIsolation.styles) {
                const styleEl = document.createElement('style');
                styleEl.textContent = config.styleIsolation.styles;
                this.root.appendChild(styleEl);
            }
        } else {
            this.root = this.host;
        }

        this._container = new ComponentContainer(this.root, (window as any).Zone?.current);
        this.add = createComponentContainerProxyFromContainer(this._container);
        parentElement.appendChild(this.host);

        registerRootForAutoRender(this);
    }

    protected createHTMLElement(): HTMLElement {
        return document.createElement('div');
    }

    public render(): void {
        // AppRoot 自身渲染逻辑
    }

    public renderAll(): void {
        this.render();
        this._container.renderAll();
    }
}

/**
 * 全局组件注册表接口，用于类型扩展
 */
export interface IComponentRegistry {
}

/**
 * 将所有基础组件注册到注册表中
 */
import * as BasicComponents from './components/basic/index';
import * as LayoutComponents from './components/layout/index';
import * as ComplexComponents from './components/complex/index';

declare module './app-root' {
    interface IComponentRegistry {
        Text: typeof BasicComponents.Text;
        Label: typeof BasicComponents.Label;
        Button: typeof BasicComponents.Button;
        Image: typeof BasicComponents.Image;
        Input: typeof BasicComponents.Input;
        Checkbox: typeof BasicComponents.Checkbox;
        Radio: typeof BasicComponents.Radio;
        Select: typeof BasicComponents.Select;
        Slider: typeof BasicComponents.Slider;
        ColorPicker: typeof BasicComponents.ColorPicker;
        ProgressBar: typeof BasicComponents.ProgressBar;

        Flex: typeof LayoutComponents.Flex;
        Container: typeof LayoutComponents.Container;
        Row: typeof LayoutComponents.Row;
        Column: typeof LayoutComponents.Column;
        Stack: typeof LayoutComponents.Stack;
        Grid: typeof LayoutComponents.Grid;
        Group: typeof LayoutComponents.Group;
        Divider: typeof LayoutComponents.Divider;
        Spacer: typeof LayoutComponents.Spacer;

        Tabs: typeof ComplexComponents.Tabs;
        Modal: typeof ComplexComponents.Modal;
        Card: typeof ComplexComponents.Card;
        Alert: typeof ComplexComponents.Alert;
        Badge: typeof ComplexComponents.Badge;
        Avatar: typeof ComplexComponents.Avatar;
        Toast: typeof ComplexComponents.Toast;
        Table: typeof ComplexComponents.Table;
        List: typeof ComplexComponents.List;
        Pagination: typeof ComplexComponents.Pagination;
        Breadcrumb: typeof ComplexComponents.Breadcrumb;
        Timeline: typeof ComplexComponents.Timeline;
        Form: typeof ComplexComponents.Form;
        DatePicker: typeof ComplexComponents.DatePicker;
        TimePicker: typeof ComplexComponents.TimePicker;
        FilePicker: typeof ComplexComponents.FilePicker;
        Calendar: typeof ComplexComponents.Calendar;
        TreeView: typeof ComplexComponents.TreeView;
    }
}

/**
 * 代理类，用于支持 appRoot.add.Label(...) 这种调用方式
 * 通过映射 IComponentRegistry 实现类型安全
 */
export type ComponentContainerProxy = {
    [K in keyof IComponentRegistry]: IComponentRegistry[K] extends ComponentConstructor<infer T>
        ? (config: ConstructorParameters<IComponentRegistry[K]>[0]) => T
        : never;
};

// 提前声明组件构造函数，稍后实现
export const componentRegistry: Record<string, ComponentConstructor<any>> = {};

export function registerComponent<K extends keyof IComponentRegistry>(
    name: K,
    ctor: IComponentRegistry[K]
) {
    componentRegistry[name as string] = ctor as any;
}

// 自动注册基础组件
Object.keys(BasicComponents).forEach(key => {
    const component = (BasicComponents as any)[key];
    if (component.prototype instanceof BaseComponent) {
        registerComponent(key as any, component);
    }
});
Object.keys(LayoutComponents).forEach(key => {
    const component = (LayoutComponents as any)[key];
    if (component.prototype instanceof BaseComponent) {
        registerComponent(key as any, component);
    }
});
Object.keys(ComplexComponents).forEach(key => {
    const component = (ComplexComponents as any)[key];
    if (component && component.prototype instanceof BaseComponent) {
        registerComponent(key as any, component);
    }
});

export function createComponentContainerProxyFromContainer(container: ComponentContainer): ComponentContainerProxy {
    return new Proxy({}, {
        get: (target, prop: string) => {
            return (config: any) => {
                const ctor = componentRegistry[prop];
                if (!ctor) {
                    throw new Error(`Component ${prop} is not registered.`);
                }
                return container.addComponent(ctor, config);
            };
        }
    }) as any;
}

export function createComponentContainerProxy(host: HTMLElement | ShadowRoot): ComponentContainerProxy {
    const container = new ComponentContainer(host, (window as any).Zone?.current);
    return createComponentContainerProxyFromContainer(container);
}
