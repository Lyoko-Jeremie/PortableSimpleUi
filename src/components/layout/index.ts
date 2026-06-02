import {BaseComponent, IComponentConfig, ComponentContainer, ContainerComponent} from '../../component';
import {createComponentContainerProxyFromContainer, ComponentContainerProxy} from '../../app-root';

/**
 * 基础容器组件
 */
export interface IContainerConfig extends IComponentConfig {
    padding?: string;
}

export class Container extends ContainerComponent<IContainerConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-container';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        if (this.config.padding) div.style.padding = this.config.padding;
        return div;
    }
}

/**
 * Flex 布局配置
 */
export interface IFlexConfig extends IComponentConfig {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap?: string;
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

/**
 * Flex 布局基础类
 */
export class Flex extends ContainerComponent<IFlexConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-flex';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'flex';
        this.updateFlexStyles(div);
        return div;
    }

    protected updateFlexStyles(el: HTMLElement) {
        if (this.config.direction) el.style.flexDirection = this.config.direction;
        if (this.config.gap) el.style.gap = this.config.gap;
        if (this.config.alignItems) el.style.alignItems = this.config.alignItems;
        if (this.config.justifyContent) el.style.justifyContent = this.config.justifyContent;
        if (this.config.flexWrap) el.style.flexWrap = this.config.flexWrap;
    }
}

/**
 * 水平布局
 */
export class Row extends Flex {
    constructor(config: Omit<IFlexConfig, 'direction'>) {
        super({...config, direction: 'row'});
    }
}

/**
 * 垂直布局
 */
export class Column extends Flex {
    constructor(config: Omit<IFlexConfig, 'direction'>) {
        super({...config, direction: 'column'});
    }
}

/**
 * 层叠布局
 */
export class Stack extends ContainerComponent<IComponentConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-stack';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.position = 'relative';
        return div;
    }
}

/**
 * 网格布局
 */
export interface IGridConfig extends IComponentConfig {
    templateColumns?: string;
    templateRows?: string;
    gap?: string;
    columnGap?: string;
    rowGap?: string;
}

export class Grid extends ContainerComponent<IGridConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-grid';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'grid';
        if (this.config.templateColumns) div.style.gridTemplateColumns = this.config.templateColumns;
        if (this.config.templateRows) div.style.gridTemplateRows = this.config.templateRows;
        if (this.config.gap) div.style.gap = this.config.gap;
        if (this.config.columnGap) div.style.columnGap = this.config.columnGap;
        if (this.config.rowGap) div.style.rowGap = this.config.rowGap;
        return div;
    }
}

/**
 * 分组布局
 */
export interface IGroupConfig extends IComponentConfig {
    title?: string;
}

export class Group extends ContainerComponent<IGroupConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-group';
    }

    private _titleElement?: HTMLElement;
    private _contentElement!: HTMLElement;

    protected createHTMLElement(): HTMLElement {
        const fieldset = document.createElement('fieldset');
        fieldset.style.border = '1px solid #ccc';
        fieldset.style.padding = '10px';
        fieldset.style.margin = '10px 0';

        if (this.config.title) {
            const legend = document.createElement('legend');
            legend.textContent = this.config.title;
            fieldset.appendChild(legend);
            this._titleElement = legend;
        }

        const div = document.createElement('div');
        fieldset.appendChild(div);
        this._contentElement = div;

        return fieldset;
    }

    public getChildrenHost(): HTMLElement {
        return this._contentElement;
    }

    public render(): void {
        super.render();
        if (this._titleElement && this.config.title) {
            this._titleElement.textContent = this.config.title;
        }
    }
}

/**
 * 分割线
 */
export interface IDividerConfig extends IComponentConfig {
    color?: string;
    thickness?: string;
    margin?: string;
    vertical?: boolean;
}

export class Divider extends BaseComponent<IDividerConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-divider';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        const color = this.config.color || '#ccc';
        const thickness = this.config.thickness || '1px';
        const margin = this.config.margin || '10px 0';

        if (this.config.vertical) {
            div.style.width = thickness;
            div.style.height = '100%';
            div.style.backgroundColor = color;
            div.style.margin = margin === '10px 0' ? '0 10px' : margin;
            div.style.display = 'inline-block';
        } else {
            div.style.width = '100%';
            div.style.height = thickness;
            div.style.backgroundColor = color;
            div.style.margin = margin;
        }
        return div;
    }
}

/**
 * 间距
 */
export interface ISpacerConfig extends IComponentConfig {
    flex?: number;
    width?: string;
    height?: string;
}

export class Spacer extends BaseComponent<ISpacerConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-spacer';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        if (this.config.flex !== undefined) {
            div.style.flex = this.config.flex.toString();
        } else {
            if (this.config.width) div.style.width = this.config.width;
            if (this.config.height) div.style.height = this.config.height;
            if (!this.config.width && !this.config.height) {
                div.style.flex = '1';
            }
        }
        return div;
    }
}
