import {DynamicValue} from './types';

export type StyleDeclaration = {
    [K in keyof CSSStyleDeclaration]?: DynamicValue<CSSStyleDeclaration[K]>;
};

export interface IComponentConfig {
    id?: string;
    style?: StyleDeclaration;
}

export abstract class BaseComponent<TConfig extends IComponentConfig = IComponentConfig> {
    public element: HTMLElement;
    public config: TConfig;
    public state: any = {};
    protected _dirty = false;

    constructor(config: TConfig) {
        this.config = config;
        this.element = this.createHTMLElement();
        this.applyConfig();
    }

    protected abstract createHTMLElement(): HTMLElement;

    protected applyConfig() {
        if (this.config.id) {
            this.element.id = this.config.id;
        }
        this.applyStyle();
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

    /**
     * 辅助方法：处理可能的动态值（signal, ref 或普通值）
     */
    protected resolveValue<T>(value: T | (() => T) | { value: T }): T {
        if (typeof value === 'function') {
            return (value as Function)();
        }
        if (value && typeof value === 'object' && 'value' in value) {
            return (value as any).value;
        }
        return value as T;
    }
}

export type ComponentConstructor<T extends BaseComponent<any>> = new (config: any) => T;

export class ComponentContainer {
    private components: BaseComponent<any>[] = [];

    constructor(private host: HTMLElement | ShadowRoot, private parentZone?: Zone) {
    }

    public addComponent<T extends BaseComponent<any>>(ctor: ComponentConstructor<T>, config: any): T {
        const component = new ctor(config);
        this.host.appendChild(component.element);
        this.components.push(component);
        // 如果有 Zone，可以在 Zone 中执行渲染逻辑
        if (this.parentZone) {
            this.parentZone.run(() => component.render());
        } else {
            component.render();
        }
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
}
