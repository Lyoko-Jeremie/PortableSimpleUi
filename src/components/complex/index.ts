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

    protected getBaseClassName(): string | null {
        return 'ps-tabs';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');

        this._headerElement = document.createElement('div');
        this._headerElement.className = 'ps-tabs-header';
        el.appendChild(this._headerElement);

        this._bodyElement = document.createElement('div');
        this._bodyElement.className = 'ps-tabs-body';
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

        // 只在项目数量变化或首次渲染时重新构建
        if (this._headerElement.children.length !== this.config.items.length) {
            this._headerElement.innerHTML = '';
            this.config.items.forEach(item => {
                const tabEl = document.createElement('div');
                tabEl.dataset.id = item.id;
                tabEl.addEventListener('click', () => {
                    const run = () => {
                        this.activeTabId = item.id;
                    };
                    const zone = (window as any).Zone?.current;
                    if (zone) {
                        zone.run(run);
                    } else {
                        run();
                    }
                });
                this._headerElement.appendChild(tabEl);
            });
        }

        // 更新状态
        Array.from(this._headerElement.children).forEach((el, index) => {
            const item = this.config.items[index];
            if (!item) return;
            const tabEl = el as HTMLElement;
            tabEl.className = `ps-tabs-item ${item.id === this._activeTabId ? 'active' : ''}`;
            tabEl.textContent = this.resolveValue(item.label);
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

    protected getBaseClassName(): string | null {
        return 'ps-modal-overlay';
    }

    protected createHTMLElement(): HTMLElement {
        this._overlay = document.createElement('div');
        this._overlay.style.position = 'fixed';
        this._overlay.style.top = '0';
        this._overlay.style.left = '0';
        this._overlay.style.width = '100%';
        this._overlay.style.height = '100%';
        this._overlay.style.display = 'none';
        this._overlay.style.zIndex = '1000';

        this._content = document.createElement('div');
        this._content.className = 'ps-modal-content';
        this._overlay.appendChild(this._content);

        this._header = document.createElement('div');
        this._header.className = 'ps-modal-header';
        this._content.appendChild(this._header);

        this._body = document.createElement('div');
        this._body.className = 'ps-modal-body';
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

    protected getBaseClassName(): string | null {
        return 'ps-card';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');

        this._header = document.createElement('div');
        this._header.className = 'ps-card-header';
        el.appendChild(this._header);

        this._body = document.createElement('div');
        this._body.className = 'ps-card-body';
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
    protected getBaseClassName(): string | null {
        return 'ps-alert';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        return el;
    }

    public render(): void {
        super.render();
        this.element.textContent = this.resolveValue(this.config.text);
        const type = this.config.type || 'info';
        this.element.className = `${this.getBaseClassName()} ps-alert-${type}`;
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
    protected getBaseClassName(): string | null {
        return 'ps-badge';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('span');
        return el;
    }

    public render(): void {
        super.render();
        this.element.textContent = this.resolveValue(this.config.text).toString();
        if (this.config.color) {
            this.element.style.backgroundColor = this.config.color;
        } else {
            this.element.style.backgroundColor = 'red';
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
    protected getBaseClassName(): string | null {
        return 'ps-avatar';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        return el;
    }

    public render(): void {
        super.render();
        const size = this.config.size || 32;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.display = 'inline-flex';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';

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
    protected getBaseClassName(): string | null {
        return 'ps-table';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('table');
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
    protected getBaseClassName(): string | null {
        return 'ps-list';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('ul');
        return el;
    }

    public render(): void {
        super.render();
        if (!this.element) return;

        const data = this.resolveValue(this.config.dataSource) || [];

        // 增量更新逻辑：如果数量不匹配，才重新生成
        // 这是一个权衡，为了防止 innerHTML='' 销毁子组件
        if (this.element.children.length !== data.length) {
            this.element.innerHTML = '';
            data.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'ps-list-item';
                this.element.appendChild(li);
            });
        }

        Array.from(this.element.children).forEach((liEl, index) => {
            const li = liEl as HTMLElement;
            const item = data[index];
            const rendered = this.config.renderItem(item, index);

            // 如果 renderItem 返回的是 HTMLElement，且它不是当前的第一个子元素
            if (rendered instanceof HTMLElement) {
                if (li.firstElementChild !== rendered) {
                    li.innerHTML = '';
                    li.appendChild(rendered);
                }
            } else {
                if (li.textContent !== String(rendered)) {
                    li.textContent = String(rendered);
                }
            }
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
        if (!this.element) return;

        const current = this.resolveValue(this.config.current);
        const total = this.resolveValue(this.config.total);
        const pageSize = this.config.pageSize || 10;
        const pageCount = Math.ceil(total / pageSize);

        if (this.element.children.length !== pageCount) {
            this.element.innerHTML = '';
            for (let i = 1; i <= pageCount; i++) {
                const btn = document.createElement('button');
                btn.textContent = i.toString();
                btn.style.padding = '2px 8px';
                btn.addEventListener('click', () => {
                    const run = () => {
                        this.config.onChange?.(i);
                    };
                    const zone = (window as any).Zone?.current;
                    if (zone) {
                        zone.run(run);
                    } else {
                        run();
                    }
                });
                this.element.appendChild(btn);
            }
        }

        Array.from(this.element.children).forEach((el, index) => {
            const i = index + 1;
            const btn = el as HTMLElement;
            if (i === current) {
                btn.style.backgroundColor = '#1890ff';
                btn.style.color = 'white';
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }
        });
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
        if (!this.element) return;

        const currentItems = this.config.items;

        // 增量更新逻辑
        if (this.element.children.length !== currentItems.length * 2 - (currentItems.length > 0 ? 1 : 0)) {
            this.element.innerHTML = '';
            currentItems.forEach((item, index) => {
                const span = document.createElement('span');
                span.dataset.index = String(index);
                this.element.appendChild(span);

                if (index < currentItems.length - 1) {
                    const sep = document.createElement('span');
                    sep.textContent = '/';
                    this.element.appendChild(sep);
                }
            });
        }

        let itemIndex = 0;
        Array.from(this.element.children).forEach((el) => {
            const span = el as HTMLElement;
            if (span.dataset.index !== undefined) {
                const item = currentItems[itemIndex++];
                if (!item) return;
                if (span.textContent !== item.label) {
                    span.textContent = item.label;
                }
                if (item.onClick) {
                    span.style.cursor = 'pointer';
                    span.style.color = '#1890ff';
                    span.addEventListener('click', () => {
                        const zone = (window as any).Zone?.current;
                        if (zone) {
                            zone.run(item.onClick!);
                        } else {
                            item.onClick!();
                        }
                    });
                } else {
                    span.style.cursor = '';
                    span.style.color = '';
                    span.onclick = null;
                }
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
        if (!this.element) return;

        const currentData = this.config.items;
        if (this.element.children.length !== currentData.length) {
            this.element.innerHTML = '';
            currentData.forEach((_, index) => {
                const itemEl = document.createElement('div');
                itemEl.style.paddingLeft = '20px';
                itemEl.style.position = 'relative';
                itemEl.style.paddingBottom = '20px';
                itemEl.style.borderLeft = '2px solid #eee';

                const dot = document.createElement('div');
                dot.className = 'psu-timeline-dot';
                dot.style.position = 'absolute';
                dot.style.left = '-7px';
                dot.style.top = '5px';
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.borderRadius = '50%';
                itemEl.appendChild(dot);

                const content = document.createElement('div');
                content.className = 'psu-timeline-content';
                itemEl.appendChild(content);

                const desc = document.createElement('div');
                desc.className = 'psu-timeline-desc';
                desc.style.fontSize = '12px';
                desc.style.color = '#999';
                itemEl.appendChild(desc);

                this.element.appendChild(itemEl);
            });
        }

        Array.from(this.element.children).forEach((el, index) => {
            const item = currentData[index];
            if (!item) return;
            const itemEl = el as HTMLElement;
            const dot = itemEl.querySelector('.psu-timeline-dot') as HTMLElement;
            const content = itemEl.querySelector('.psu-timeline-content') as HTMLElement;
            const desc = itemEl.querySelector('.psu-timeline-desc') as HTMLElement;

            if (dot) dot.style.backgroundColor = item.color || '#1890ff';
            if (content) content.textContent = item.content;
            if (desc) {
                desc.textContent = item.description || '';
                desc.style.display = item.description ? 'block' : 'none';
            }
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

                // @ts-ignore
                const container = new ComponentContainer(itemEl, (window as any).Zone?.current);
                // @ts-ignore
                const ctor = (window as any).psuComponentRegistry?.[item.component as string];
                if (!ctor) {
                    console.warn(`Component ${item.component} not found in registry`);
                    return;
                }
                const component = container.addComponent(ctor, {
                    ...(item.componentConfig as any),
                    onChange: (val: any) => {
                        this._values[item.key] = val;
                        (item.componentConfig as any).onChange?.(val);
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
        el.addEventListener('change', (e) => {
            const run = () => {
                const files = (e.target as HTMLInputElement).files;
                this.config.onChange?.(files);
            };
            const zone = (window as any).Zone?.current;
            if (zone) {
                zone.run(run);
            } else {
                run();
            }
        });
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
    expandedKeys?: string[];
    onSelect?: (key: string) => void;
    onExpand?: (expandedKeys: string[]) => void;
}

export class TreeView extends BaseComponent<ITreeViewConfig> {
    private expandedKeys: Set<string> = new Set();

    constructor(config: ITreeViewConfig) {
        super(config);
        if (config.expandedKeys) {
            this.expandedKeys = new Set(config.expandedKeys);
        }
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'psu-treeview';
        return el;
    }

    public render(): void {
        super.render();
        if (!this.element) return;

        const currentData = this.config.data;
        this.element.innerHTML = '';
        this.renderNodes(currentData, this.element);
    }

    private toggleExpand(key: string) {
        if (this.expandedKeys.has(key)) {
            this.expandedKeys.delete(key);
        } else {
            this.expandedKeys.add(key);
        }
        this.config.onExpand?.(Array.from(this.expandedKeys));
        this.markDirty();
    }

    private renderNodes(nodes: ITreeNode[], parent: HTMLElement) {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.paddingLeft = '20px';
        ul.style.margin = '0';
        nodes.forEach(node => {
            const li = document.createElement('li');
            const itemContainer = document.createElement('div');
            itemContainer.style.display = 'flex';
            itemContainer.style.alignItems = 'center';
            itemContainer.style.cursor = 'pointer';

            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = this.expandedKeys.has(node.key);

            // 展开/收起按钮
            const switcher = document.createElement('button');
            switcher.style.display = 'inline-block';
            switcher.style.width = '24px';
            switcher.style.height = '24px';
            switcher.style.lineHeight = '24px';
            switcher.style.textAlign = 'center';
            switcher.style.userSelect = 'none';
            switcher.style.border = 'none';
            switcher.style.background = 'transparent';
            switcher.style.cursor = 'pointer';
            switcher.style.padding = '0';
            if (hasChildren) {
                switcher.textContent = isExpanded ? '▼' : '▶';
                const toggle = (e: MouseEvent) => {
                    e.stopPropagation();
                    const run = () => this.toggleExpand(node.key);
                    const zone = (window as any).Zone?.current;
                    if (zone) zone.run(run); else run();
                };
                switcher.addEventListener('click', toggle);
            } else {
                switcher.style.visibility = 'hidden';
            }
            itemContainer.appendChild(switcher);

            const title = document.createElement('span');
            title.textContent = node.title;
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                const run = () => {
                    this.config.onSelect?.(node.key);
                };
                const zone = (window as any).Zone?.current;
                if (zone) {
                    zone.run(run);
                } else {
                    run();
                }
            });
            itemContainer.appendChild(title);
            li.appendChild(itemContainer);

            if (hasChildren && isExpanded) {
                this.renderNodes(node.children!, li);
            }
            ul.appendChild(li);
        });
        parent.appendChild(ul);
    }
}
