import {BaseComponent, IComponentConfig, ComponentContainer, ComponentConstructor} from './component';
import {IZoneWrapper} from './core';
import {DEFAULT_THEME_CSS} from './theme';

export interface IAppRootConfig extends IComponentConfig {
    zoneWrapper: IZoneWrapper;
    styleIsolation?: {
        mode: 'shadow' | 'none';
        styles?: string;
        /** 是否使用默认主题 */
        useDefaultTheme?: boolean;
    };
}

export class AppRoot extends BaseComponent<IAppRootConfig> {
    public host: HTMLElement;
    public rootShadow: HTMLElement | ShadowRoot;
    public rootElement: HTMLElement;
    public add: ComponentContainerProxy;
    public zoneWrapper: IZoneWrapper;
    private _container: ComponentContainer;

    constructor(parentElement: HTMLElement, config: IAppRootConfig) {
        super(config, config.zoneWrapper);
        this.zoneWrapper = config.zoneWrapper;
        this.host = this.element;

        const useDefaultTheme = config.styleIsolation?.useDefaultTheme;

        const targetZone = this.zoneWrapper;

        if (config.styleIsolation?.mode === 'shadow') {
            this.rootShadow = this.host.attachShadow({mode: 'open'});
            this.rootElement = document.createElement('div');
            this.rootElement .classList.add('ps-shadow-root');
            this.rootShadow.appendChild(this.rootElement );

            if (useDefaultTheme || config.styleIsolation.styles) {
                const styleEl = document.createElement('style');
                let styles = '';
                if (useDefaultTheme) {
                    styles += DEFAULT_THEME_CSS;
                }
                if (config.styleIsolation.styles) {
                    styles += config.styleIsolation.styles;
                }
                styleEl.textContent = styles;
                this.rootShadow.appendChild(styleEl);
            }
            this._container = new ComponentContainer(this.rootElement , targetZone);
        } else {
            this.rootShadow = this.host;
            this.rootElement = this.host;
            this.host.classList.add('ps-root');
            this._container = new ComponentContainer(this.rootShadow, targetZone);
        }

        this.add = createComponentContainerProxyFromContainer(this._container);
        parentElement.appendChild(this.host);

        this.zoneWrapper.registerRoot(this);
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

    public destroy(): void {
        this._container.destroy();
        this.zoneWrapper.unregisterRoot(this);
        if (this.host && this.host.parentElement) {
            this.host.parentElement.removeChild(this.host);
        }
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
import * as AdvancedComponents from './components/advanced/index';
import * as GraphicsComponents from './components/graphics/index';

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

        Autocomplete: typeof AdvancedComponents.Autocomplete;
        Multiselect: typeof AdvancedComponents.Multiselect;

        Canvas: typeof GraphicsComponents.Canvas;
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
Object.keys(AdvancedComponents).forEach(key => {
    const component = (AdvancedComponents as any)[key];
    if (component && component.prototype instanceof BaseComponent) {
        registerComponent(key as any, component);
    }
});
Object.keys(GraphicsComponents).forEach(key => {
    const component = (GraphicsComponents as any)[key];
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

export function createComponentContainerProxy(host: HTMLElement | ShadowRoot, zoneWrapper: IZoneWrapper): ComponentContainerProxy {
    const container = new ComponentContainer(host, zoneWrapper);
    return createComponentContainerProxyFromContainer(container);
}
