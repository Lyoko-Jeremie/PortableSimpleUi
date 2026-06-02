import {BaseComponent, IComponentConfig, ComponentContainer} from '../component';
import {createComponentContainerProxyFromContainer, ComponentContainerProxy, IComponentRegistry} from '../app-root';

declare module '../app-root' {
    interface IComponentRegistry {
        Label: typeof Label;
        Button: typeof Button;
        Flex: typeof Flex;
    }
}

export type DynamicValue<T> = T | (() => T) | { value: T };

export interface ILabelConfig extends IComponentConfig {
    text: DynamicValue<string>;
}

export class Label extends BaseComponent<ILabelConfig> {
    protected createHTMLElement(): HTMLElement {
        return document.createElement('span');
    }

    public render(): void {
        const text = this.resolveValue(this.config.text);
        this.element.textContent = text;
    }
}

export interface IButtonConfig extends IComponentConfig {
    text: DynamicValue<string>;
    onClick?: (self: Button) => void;
}

export class Button extends BaseComponent<IButtonConfig> {
    constructor(config: IButtonConfig) {
        super(config);
        this.state.text = this.resolveValue(config.text);
    }

    protected createHTMLElement(): HTMLElement {
        const btn = document.createElement('button');
        btn.onclick = () => {
            if (this.config.onClick) {
                this.config.onClick(this);
                this.render(); // 默认执行一次渲染
            }
        };
        return btn;
    }

    public render(): void {
        // 如果 state.text 有值，优先使用 state.text
        const text = this.state.text !== undefined ? this.state.text : this.resolveValue(this.config.text);
        this.element.textContent = text;
    }
}

export interface IFlexConfig extends IComponentConfig {
    // 可以在这里添加 Flex 特有的配置
}

export class Flex extends BaseComponent<IFlexConfig> {
    public isLayout = true;
    public add: ComponentContainerProxy;
    private _container: ComponentContainer;

    constructor(config: IFlexConfig) {
        super(config);
        this._container = new ComponentContainer(this.element, (window as any).Zone?.current);
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'flex';
        return div;
    }

    public render(): void {
        // Flex 容器自身的渲染逻辑
    }

    public renderAll(): void {
        this.render();
        this._container.renderAll();
    }
}
