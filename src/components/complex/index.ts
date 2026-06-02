import {BaseComponent, ContainerComponent, IComponentConfig, ComponentContainer} from '../../component';
import {createComponentContainerProxyFromContainer} from '../../app-root';
import {DynamicValue} from '../../types';

/**
 * Tabs 组件
 */
export interface ITabItem {
    label: DynamicValue<string>;
    id: string;
}

export interface ITabsConfig extends IComponentConfig {
    items: ITabItem[];
    activeTabId?: string;
    onChange?: (tabId: string, self: Tabs) => void;
}

export class Tabs extends ContainerComponent<ITabsConfig> {
    private _activeTabId: string;
    private _headerElement!: HTMLElement;
    private _bodyElement!: HTMLElement;

    constructor(config: ITabsConfig) {
        super(config);
        this._activeTabId = config.activeTabId || (config.items.length > 0 ? config.items[0]!.id : '');
        this._container = new ComponentContainer(this.getChildrenHost(), (window as any).Zone?.current);
        this.add = createComponentContainerProxyFromContainer(this._container);
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-tabs';

        this._headerElement = document.createElement('div');
        this._headerElement.className = 'psu-tabs-header';
        el.appendChild(this._headerElement);

        this._bodyElement = document.createElement('div');
        this._bodyElement.className = 'psu-tabs-body';
        el.appendChild(this._bodyElement);

        return el;
    }

    protected getChildrenHost(): HTMLElement {
        if (!this._bodyElement) {
            this.element = this.createHTMLElement();
        }
        return this._bodyElement;
    }

    public get activeTabId() {
        return this._activeTabId;
    }

    public set activeTabId(id: string) {
        if (this._activeTabId !== id) {
            this._activeTabId = id;
            this.config.onChange?.(id, this);
            this.markDirty();
        }
    }

    public render(): void {
        super.render();
        this.renderHeader();
        this.renderBody();
    }

    private renderHeader() {
        if (!this._headerElement) return;
        this._headerElement.innerHTML = '';
        this.config.items.forEach(item => {
            const tabEl = document.createElement('div');
            tabEl.className = `psu-tabs-item ${item.id === this._activeTabId ? 'active' : ''}`;
            tabEl.textContent = this.resolveValue(item.label);
            tabEl.onclick = () => {
                this.activeTabId = item.id;
            };
            this._headerElement.appendChild(tabEl);
        });
    }

    private renderBody() {
        if (!this._bodyElement) return;
        // 在简易实现中，我们通过显示/隐藏子元素来控制
        // 假设子组件的顺序与 items 一致，或者子组件有自己的 id 匹配
        const children = Array.from(this._bodyElement.children) as HTMLElement[];
        children.forEach((child, index) => {
            const item = this.config.items[index];
            if (item) {
                child.style.display = item.id === this._activeTabId ? 'block' : 'none';
            }
        });
    }
}

/**
 * Modal 组件
 */
export interface IModalConfig extends IComponentConfig {
    title?: DynamicValue<string>;
    visible?: DynamicValue<boolean>;
    onClose?: (self: Modal) => void;
}

export class Modal extends ContainerComponent<IModalConfig> {
    private _overlay!: HTMLElement;
    private _content!: HTMLElement;
    private _header!: HTMLElement;
    private _body!: HTMLElement;

    protected createHTMLElement(): HTMLElement {
        this._overlay = document.createElement('div');
        this._overlay.className = 'psu-modal-overlay';
        this._overlay.style.position = 'fixed';
        this._overlay.style.top = '0';
        this._overlay.style.left = '0';
        this._overlay.style.width = '100%';
        this._overlay.style.height = '100%';
        this._overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this._overlay.style.display = 'none';
        this._overlay.style.zIndex = '1000';
        this._overlay.style.justifyContent = 'center';
        this._overlay.style.alignItems = 'center';

        this._content = document.createElement('div');
        this._content.className = 'psu-modal-content';
        this._content.style.backgroundColor = 'white';
        this._content.style.padding = '20px';
        this._content.style.borderRadius = '4px';
        this._content.style.minWidth = '300px';
        this._overlay.appendChild(this._content);

        this._header = document.createElement('div');
        this._header.className = 'psu-modal-header';
        this._content.appendChild(this._header);

        this._body = document.createElement('div');
        this._body.className = 'psu-modal-body';
        this._content.appendChild(this._body);

        return this._overlay;
    }

    protected getChildrenHost(): HTMLElement {
        return this._body;
    }

    public show() {
        this.config.visible = true;
        this.markDirty();
    }

    public hide() {
        this.config.visible = false;
        this.markDirty();
        this.config.onClose?.(this);
    }

    public render(): void {
        super.render();
        if (!this._overlay) return;
        const visible = this.resolveValue(this.config.visible);
        this._overlay.style.display = visible ? 'flex' : 'none';

        if (this.config.title && this._header) {
            this._header.textContent = this.resolveValue(this.config.title);
        }
    }
}

/**
 * Card 组件
 */
export interface ICardConfig extends IComponentConfig {
    title?: DynamicValue<string>;
}

export class Card extends ContainerComponent<ICardConfig> {
    private _header!: HTMLElement;
    private _body!: HTMLElement;

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-card';
        el.style.border = '1px solid #ccc';
        el.style.borderRadius = '4px';
        el.style.padding = '10px';

        this._header = document.createElement('div');
        this._header.className = 'psu-card-header';
        this._header.style.fontWeight = 'bold';
        this._header.style.marginBottom = '10px';
        el.appendChild(this._header);

        this._body = document.createElement('div');
        this._body.className = 'psu-card-body';
        el.appendChild(this._body);

        return el;
    }

    protected getChildrenHost(): HTMLElement {
        return this._body;
    }

    public render(): void {
        super.render();
        if (!this._header) return;
        if (this.config.title) {
            this._header.textContent = this.resolveValue(this.config.title);
            this._header.style.display = 'block';
        } else {
            this._header.style.display = 'none';
        }
    }
}

/**
 * Alert 组件
 */
export interface IAlertConfig extends IComponentConfig {
    text: DynamicValue<string>;
    type?: 'info' | 'success' | 'warning' | 'error';
}

export class Alert extends BaseComponent<IAlertConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-alert';
        el.style.padding = '10px';
        el.style.margin = '5px 0';
        el.style.borderRadius = '4px';
        return el;
    }

    public render(): void {
        super.render();
        this.element.textContent = this.resolveValue(this.config.text);
        const type = this.config.type || 'info';
        const colors = {
            info: {bg: '#e6f7ff', border: '#91d5ff'},
            success: {bg: '#f6ffed', border: '#b7eb8f'},
            warning: {bg: '#fffbe6', border: '#ffe58f'},
            error: {bg: '#fff1f0', border: '#ffa39e'}
        };
        const color = colors[type];
        this.element.style.backgroundColor = color.bg;
        this.element.style.border = `1px solid ${color.border}`;
    }
}

/**
 * Badge 组件
 */
export interface IBadgeConfig extends IComponentConfig {
    text: DynamicValue<string | number>;
    color?: string;
}

export class Badge extends BaseComponent<IBadgeConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('span');
        el.className = 'psu-badge';
        el.style.padding = '2px 6px';
        el.style.borderRadius = '10px';
        el.style.fontSize = '12px';
        el.style.color = 'white';
        el.style.backgroundColor = 'red';
        return el;
    }

    public render(): void {
        super.render();
        this.element.textContent = this.resolveValue(this.config.text).toString();
        if (this.config.color) {
            this.element.style.backgroundColor = this.config.color;
        }
    }
}

/**
 * Avatar 组件
 */
export interface IAvatarConfig extends IComponentConfig {
    src?: DynamicValue<string>;
    text?: DynamicValue<string>;
    size?: number;
}

export class Avatar extends BaseComponent<IAvatarConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-avatar';
        el.style.display = 'inline-flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.overflow = 'hidden';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#ccc';
        return el;
    }

    public render(): void {
        super.render();
        const size = this.config.size || 32;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;

        const src = this.resolveValue(this.config.src);
        if (src) {
            this.element.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            this.element.textContent = this.resolveValue(this.config.text) || '';
        }
    }
}

/**
 * Toast 组件
 */
export interface IToastConfig extends IComponentConfig {
    text: DynamicValue<string>;
    duration?: number;
}

export class Toast extends BaseComponent<IToastConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-toast';
        el.style.position = 'fixed';
        el.style.top = '20px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.padding = '10px 20px';
        el.style.backgroundColor = 'rgba(0,0,0,0.7)';
        el.style.color = 'white';
        el.style.borderRadius = '4px';
        el.style.zIndex = '2000';
        return el;
    }

    constructor(config: IToastConfig) {
        super(config);
        const duration = config.duration || 3000;
        setTimeout(() => {
            if (this.element && this.element.parentElement) {
                this.element.parentElement.removeChild(this.element);
            }
        }, duration);
    }

    public render(): void {
        super.render();
        this.element.textContent = this.resolveValue(this.config.text);
    }
}

/**
 * Table 组件
 */
export interface ITableColumn<T> {
    title: string;
    key: keyof T;
    render?: (value: any, record: T) => string | HTMLElement;
}

export interface ITableConfig<T = any> extends IComponentConfig {
    columns: ITableColumn<T>[];
    dataSource: DynamicValue<T[]>;
}

export class Table extends BaseComponent<ITableConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('table');
        el.className = 'psu-table';
        el.style.width = '100%';
        el.style.borderCollapse = 'collapse';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        const data = this.resolveValue(this.config.dataSource) || [];

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        this.config.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.title;
            th.style.borderBottom = '1px solid #ccc';
            th.style.textAlign = 'left';
            th.style.padding = '8px';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        this.element.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        data.forEach(record => {
            const tr = document.createElement('tr');
            this.config.columns.forEach(col => {
                const td = document.createElement('td');
                td.style.padding = '8px';
                td.style.borderBottom = '1px solid #eee';
                const val = record[col.key];
                if (col.render) {
                    const rendered = col.render(val, record);
                    if (rendered instanceof HTMLElement) {
                        td.appendChild(rendered);
                    } else {
                        td.textContent = rendered;
                    }
                } else {
                    td.textContent = String(val);
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        this.element.appendChild(tbody);
    }
}

/**
 * List 组件
 */
export interface IListConfig<T = any> extends IComponentConfig {
    dataSource: DynamicValue<T[]>;
    renderItem: (item: T, index: number) => string | HTMLElement;
}

export class List extends BaseComponent<IListConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('ul');
        el.className = 'psu-list';
        el.style.listStyle = 'none';
        el.style.padding = '0';
        el.style.margin = '0';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        const data = this.resolveValue(this.config.dataSource) || [];

        data.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'psu-list-item';
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid #eee';
            const rendered = this.config.renderItem(item, index);
            if (rendered instanceof HTMLElement) {
                li.appendChild(rendered);
            } else {
                li.textContent = rendered;
            }
            this.element.appendChild(li);
        });
    }
}

/**
 * Pagination 组件
 */
export interface IPaginationConfig extends IComponentConfig {
    current: DynamicValue<number>;
    total: DynamicValue<number>;
    pageSize?: number;
    onChange?: (page: number) => void;
}

export class Pagination extends BaseComponent<IPaginationConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-pagination';
        el.style.display = 'flex';
        el.style.gap = '5px';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        const current = this.resolveValue(this.config.current);
        const total = this.resolveValue(this.config.total);
        const pageSize = this.config.pageSize || 10;
        const pageCount = Math.ceil(total / pageSize);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.textContent = i.toString();
            btn.style.padding = '2px 8px';
            if (i === current) {
                btn.style.backgroundColor = '#1890ff';
                btn.style.color = 'white';
            }
            btn.onclick = () => {
                this.config.onChange?.(i);
            };
            this.element.appendChild(btn);
        }
    }
}

/**
 * Breadcrumb 组件
 */
export interface IBreadcrumbItem {
    label: string;
    onClick?: () => void;
}

export interface IBreadcrumbConfig extends IComponentConfig {
    items: IBreadcrumbItem[];
}

export class Breadcrumb extends BaseComponent<IBreadcrumbConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-breadcrumb';
        el.style.display = 'flex';
        el.style.gap = '5px';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        this.config.items.forEach((item, index) => {
            const span = document.createElement('span');
            span.textContent = item.label;
            if (item.onClick) {
                span.style.cursor = 'pointer';
                span.style.color = '#1890ff';
                span.onclick = item.onClick;
            }
            this.element.appendChild(span);

            if (index < this.config.items.length - 1) {
                const sep = document.createElement('span');
                sep.textContent = '/';
                sep.style.color = '#ccc';
                this.element.appendChild(sep);
            }
        });
    }
}

/**
 * Timeline 组件
 */
export interface ITimelineItem {
    content: string;
    description?: string;
    color?: string;
}

export interface ITimelineConfig extends IComponentConfig {
    items: ITimelineItem[];
}

export class Timeline extends BaseComponent<ITimelineConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-timeline';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        this.config.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.style.paddingLeft = '20px';
            itemEl.style.position = 'relative';
            itemEl.style.paddingBottom = '20px';
            itemEl.style.borderLeft = '2px solid #eee';

            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = '-7px';
            dot.style.top = '5px';
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = item.color || '#1890ff';
            itemEl.appendChild(dot);

            const content = document.createElement('div');
            content.textContent = item.content;
            itemEl.appendChild(content);

            if (item.description) {
                const desc = document.createElement('div');
                desc.textContent = item.description;
                desc.style.fontSize = '12px';
                desc.style.color = '#999';
                itemEl.appendChild(desc);
            }

            this.element.appendChild(itemEl);
        });
    }
}

/**
 * Form 组件
 */
export interface IFormItemConfig {
    label: string;
    key: string;
    component: keyof IComponentRegistry;
    componentConfig: any;
}

export interface IFormConfig extends IComponentConfig {
    items: IFormItemConfig[];
    onFinish?: (values: Record<string, any>) => void;
}

import {IComponentRegistry} from '../../app-root';

export class Form extends BaseComponent<IFormConfig> {
    private _values: Record<string, any> = {};

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('form');
        el.className = 'psu-form';
        el.onsubmit = (e) => {
            e.preventDefault();
            this.config.onFinish?.(this._values);
        };
        return el;
    }

    public render(): void {
        super.render();
        if (this.element.innerHTML === '') {
            this.config.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'psu-form-item';
                itemEl.style.marginBottom = '10px';

                const label = document.createElement('label');
                label.textContent = item.label;
                label.style.display = 'block';
                itemEl.appendChild(label);

                const container = new ComponentContainer(itemEl, (window as any).Zone?.current);
                const ctor = componentRegistry[item.component as string];
                if (!ctor) {
                    console.warn(`Component ${item.component} not found in registry`);
                    return;
                }
                const component = container.addComponent(ctor, {
                    ...item.componentConfig,
                    onChange: (val: any) => {
                        this._values[item.key] = val;
                        item.componentConfig.onChange?.(val);
                    }
                });

                this.element.appendChild(itemEl);
            });

            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.textContent = 'Submit';
            this.element.appendChild(submitBtn);
        }
    }
}

// 需要从 app-root 导入或定义 componentRegistry 的引用
// 实际上组件已经在 app-root 中通过 registerComponent 注册到了全局 registry
import {componentRegistry} from '../../app-root';

/**
 * DatePicker 组件 (简易实现)
 */
export interface IDatePickerConfig extends IComponentConfig {
    value?: DynamicValue<string>;
    onChange?: (value: string) => void;
}

export class DatePicker extends BaseComponent<IDatePickerConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('input');
        el.type = 'date';
        el.className = 'psu-datepicker';
        el.onchange = (e) => {
            const val = (e.target as HTMLInputElement).value;
            this.config.onChange?.(val);
        };
        return el;
    }

    public render(): void {
        super.render();
        const val = this.resolveValue(this.config.value);
        if (val) {
            (this.element as HTMLInputElement).value = val;
        }
    }
}

/**
 * TimePicker 组件 (简易实现)
 */
export interface ITimePickerConfig extends IComponentConfig {
    value?: DynamicValue<string>;
    onChange?: (value: string) => void;
}

export class TimePicker extends BaseComponent<ITimePickerConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('input');
        el.type = 'time';
        el.className = 'psu-timepicker';
        el.onchange = (e) => {
            const val = (e.target as HTMLInputElement).value;
            this.config.onChange?.(val);
        };
        return el;
    }

    public render(): void {
        super.render();
        const val = this.resolveValue(this.config.value);
        if (val) {
            (this.element as HTMLInputElement).value = val;
        }
    }
}

/**
 * FilePicker 组件
 */
export interface IFilePickerConfig extends IComponentConfig {
    accept?: string;
    multiple?: boolean;
    onChange?: (files: FileList | null) => void;
}

export class FilePicker extends BaseComponent<IFilePickerConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('input');
        el.type = 'file';
        el.className = 'psu-filepicker';
        el.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            this.config.onChange?.(files);
        };
        return el;
    }

    public render(): void {
        super.render();
        if (this.config.accept) {
            (this.element as HTMLInputElement).accept = this.config.accept;
        }
        if (this.config.multiple) {
            (this.element as HTMLInputElement).multiple = this.config.multiple;
        }
    }
}

/**
 * Calendar 组件 (基础展示)
 */
export interface ICalendarConfig extends IComponentConfig {
    value?: DynamicValue<Date>;
}

export class Calendar extends BaseComponent<ICalendarConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-calendar';
        el.style.border = '1px solid #ccc';
        el.style.padding = '10px';
        return el;
    }

    public render(): void {
        super.render();
        const date = this.resolveValue(this.config.value) || new Date();
        this.element.innerHTML = `<div>${date.getFullYear()}年${date.getMonth() + 1}月</div>`;
        // 简易展示，不实现完整交互
    }
}

/**
 * TreeView 组件
 */
export interface ITreeNode {
    title: string;
    key: string;
    children?: ITreeNode[];
}

export interface ITreeViewConfig extends IComponentConfig {
    data: ITreeNode[];
    onSelect?: (key: string) => void;
}

export class TreeView extends BaseComponent<ITreeViewConfig> {
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-treeview';
        return el;
    }

    public render(): void {
        super.render();
        this.element.innerHTML = '';
        this.renderNodes(this.config.data, this.element);
    }

    private renderNodes(nodes: ITreeNode[], parent: HTMLElement) {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.paddingLeft = '20px';
        nodes.forEach(node => {
            const li = document.createElement('li');
            const title = document.createElement('span');
            title.textContent = node.title;
            title.style.cursor = 'pointer';
            title.onclick = (e) => {
                e.stopPropagation();
                this.config.onSelect?.(node.key);
            };
            li.appendChild(title);

            if (node.children && node.children.length > 0) {
                this.renderNodes(node.children, li);
            }
            ul.appendChild(li);
        });
        parent.appendChild(ul);
    }
}
