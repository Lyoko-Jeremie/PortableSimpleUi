import {BaseComponent, IComponentConfig, ComponentContainer} from '../../component';
import {createComponentContainerProxyFromContainer, ComponentContainerProxy} from '../../app-root';

export interface IFlexConfig extends IComponentConfig {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap?: string;
    alignItems?: string;
    justifyContent?: string;
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
        if (this.config.direction) div.style.flexDirection = this.config.direction;
        if (this.config.gap) div.style.gap = this.config.gap;
        if (this.config.alignItems) div.style.alignItems = this.config.alignItems;
        if (this.config.justifyContent) div.style.justifyContent = this.config.justifyContent;
        return div;
    }

    public render(): void {
        super.render();
        // Flex 容器自身的渲染逻辑
    }

    public renderAll(): void {
        this.render();
        this._container.renderAll();
    }
}
