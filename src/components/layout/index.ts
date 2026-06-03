import {BaseComponent, IComponentConfig, ComponentContainer, ContainerComponent} from '../../component';
import {createComponentContainerProxyFromContainer, ComponentContainerProxy} from '../../app-root';
import {IZoneWrapper} from '../../core';
import {DynamicValue} from '../../types';

/**
 * 基础容器组件
 */
export interface IContainerConfig extends IComponentConfig {
    padding?: string;
}

export class Container extends ContainerComponent<IContainerConfig> {
    constructor(config: IContainerConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 暴露 add 代理，便于以链式方式向容器追加子组件。
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected getBaseClassName(): string | null {
        return 'ps-container';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        // 仅在传入 padding 时设置，避免覆盖外部样式。
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
    constructor(config: IFlexConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 与 Container 一致，对外提供子组件添加能力。
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected getBaseClassName(): string | null {
        return 'ps-flex';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'flex';
        // 将配置中的布局参数同步到元素样式。
        this.updateFlexStyles(div);
        return div;
    }

    protected updateFlexStyles(el: HTMLElement) {
        // 按需写入样式，未配置项保持浏览器默认值。
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
    constructor(config: Omit<IFlexConfig, 'direction'>, zoneWrapper: IZoneWrapper) {
        // 固定为横向排列，调用方不能覆写 direction。
        super({...config, direction: 'row'}, zoneWrapper);
    }
}

/**
 * 垂直布局
 */
export class Column extends Flex {
    constructor(config: Omit<IFlexConfig, 'direction'>, zoneWrapper: IZoneWrapper) {
        // 固定为纵向排列，调用方不能覆写 direction。
        super({...config, direction: 'column'}, zoneWrapper);
    }
}

/**
 * 层叠布局
 */
export class Stack extends ContainerComponent<IComponentConfig> {
    constructor(config: IComponentConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 复用容器代理能力，统一子组件管理接口。
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected getBaseClassName(): string | null {
        return 'ps-stack';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        // 作为绝对定位子元素的定位上下文。
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
    constructor(config: IGridConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 保持与其他容器类一致的 add 行为。
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected getBaseClassName(): string | null {
        return 'ps-grid';
    }

    protected createHTMLElement(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'grid';
        // 仅设置已提供的网格参数，避免无意覆盖默认布局。
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
    title?: DynamicValue<string>;
}

export class Group extends ContainerComponent<IGroupConfig> {
    constructor(config: IGroupConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 分组内部同样支持通过 add 插入子组件。
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected getBaseClassName(): string | null {
        return 'ps-group';
    }

    private _titleElement!: HTMLElement;
    private _contentElement!: HTMLElement;

    protected createHTMLElement(): HTMLElement {
        const fieldset = document.createElement('fieldset');
        fieldset.style.border = '1px solid #ccc';
        fieldset.style.padding = '10px';
        fieldset.style.margin = '10px 0';

        const legend = document.createElement('legend');
        fieldset.appendChild(legend);
        // 缓存标题节点，便于后续 render 更新文案与显示状态。
        this._titleElement = legend;

        const div = document.createElement('div');
        fieldset.appendChild(div);
        // 缓存内容节点，子组件将挂载到该节点。
        this._contentElement = div;

        return fieldset;
    }

    protected getChildrenHost(): HTMLElement {
        return this._contentElement;
    }

    public render(): void {
        super.render();
        const legend = this.getElement().querySelector('legend');
        if (legend) {
            const val = this.config.title;
            // title 支持动态值，这里统一解析后再渲染。
            const title = val !== undefined ? this.resolveValue(val) : undefined;
            if (title !== undefined) {
                legend.textContent = title;
                legend.style.display = '';
            } else {
                // 未提供标题时隐藏 legend，避免保留空白占位。
                legend.style.display = 'none';
            }
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
        // 提供默认值，确保分割线在最少配置下可见。
        const color = this.config.color || '#ccc';
        const thickness = this.config.thickness || '1px';
        const margin = this.config.margin || '10px 0';

        if (this.config.vertical) {
            // 纵向分割线：宽度为 thickness，高度撑满父容器。
            div.style.width = thickness;
            div.style.height = '100%';
            div.style.backgroundColor = color;
            div.style.margin = margin === '10px 0' ? '0 10px' : margin;
            div.style.display = 'inline-block';
        } else {
            // 横向分割线：高度为 thickness，宽度撑满父容器。
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
            // 显式 flex 优先，用于在弹性布局中分配剩余空间。
            div.style.flex = this.config.flex.toString();
        } else {
            // 未指定 flex 时，退化为固定尺寸占位。
            if (this.config.width) div.style.width = this.config.width;
            if (this.config.height) div.style.height = this.config.height;
            if (!this.config.width && !this.config.height) {
                // 没有任何尺寸参数时默认占用一份弹性空间。
                div.style.flex = '1';
            }
        }
        return div;
    }
}
