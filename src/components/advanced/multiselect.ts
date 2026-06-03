/**
 * ============================================================
 *  Multiselect 组件 — 架构总览与工作流程
 * ============================================================
 *
 * 一、DOM 结构
 * ─────────────────────────────────────────────────────────
 *   <div class="ps-multiselect-container">   ← 根节点 (element)
 *     <div class="ps-multiselect-input-wrapper"> ← 模拟输入框外观
 *        <span class="ps-multiselect-tag">已选 1 <span class="ps-multiselect-tag-close">×</span></span>
 *        <input class="ps-multiselect-input">   ← inputEl (用于搜索)
 *     </div>
 *     <div  class="ps-multiselect-dropdown"> ← dropdownEl
 *       <div class="ps-multiselect-item">选项 A <span class="ps-multiselect-checkbox"></span></div>
 *       ...
 *     </div>
 *   </div>
 */

import {BaseComponent, IComponentConfig} from '../../component';
import {IZoneWrapper} from '../../core';
import {DynamicValue} from '../../types';

/**
 * 多选项配置接口
 */
export interface IMultiselectOption {
    /** 选项的唯一标识符，如果未提供则使用 value */
    key?: DynamicValue<string>;
    /** 选项的值 */
    value?: DynamicValue<string>;
    /** 选项显示的文本标签 */
    label: DynamicValue<string>;
}

/**
 * 解析后的多选项接口（移除 DynamicValue 后的状态）
 */
export interface IResolvedMultiselectOption {
    /** 选项的唯一标识符 */
    key: string;
    /** 选项显示的文本标签 */
    label: string;
}

/**
 * Multiselect 组件配置接口
 */
export interface IMultiselectConfig extends IComponentConfig {
    /** 选项列表 */
    options: DynamicValue<IMultiselectOption[]>;
    /** 已选中的值数组 (多选) */
    value?: DynamicValue<string[]>;
    /** 输入框占位符 */
    placeholder?: DynamicValue<string>;
    /** 当搜索输入发生变化时的回调 */
    onSearch?: (query: string, self: Multiselect) => void;
    /** 当选中状态发生变化时的回调 */
    onSelect?: (options: IResolvedMultiselectOption[], self: Multiselect) => void;
    /** 自定义过滤逻辑 */
    filter?: (query: string, option: IResolvedMultiselectOption) => boolean;
}

/**
 * Multiselect 多选组件
 * 支持搜索、多选标签展示、下拉选择等功能
 */
export class Multiselect extends BaseComponent<IMultiselectConfig> {
    private inputEl: HTMLInputElement = null as any;
    private inputWrapperEl: HTMLDivElement = null as any;
    private dropdownEl: HTMLDivElement = null as any;
    private isDropdownOpen = false;
    private onDocumentMouseDown!: (event: MouseEvent) => void;

    constructor(config: IMultiselectConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        this.inputEl = this.element.querySelector('.ps-multiselect-input') as HTMLInputElement;
        this.inputWrapperEl = this.element.querySelector('.ps-multiselect-input-wrapper') as HTMLDivElement;
        this.dropdownEl = this.element.querySelector('.ps-multiselect-dropdown') as HTMLDivElement;

        this.bindInputEvents();
        this.bindDocumentOutsideClick();

        this.state.query = '';
        this.state.selectedKeys = [] as string[];
    }

    protected getBaseClassName(): string | null {
        return 'ps-multiselect-container';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');

        const wrapper = document.createElement('div');
        wrapper.className = 'ps-multiselect-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.className = 'ps-multiselect-input';

        wrapper.appendChild(input);

        const dropdown = document.createElement('div');
        dropdown.className = 'ps-multiselect-dropdown';
        dropdown.style.display = 'none';

        container.appendChild(wrapper);
        container.appendChild(dropdown);

        return container;
    }

    /**
     * 设置组件的选项列表
     * @param options 选项数组或动态值
     */
    public setOptions(options: DynamicValue<IMultiselectOption[]>): void {
        this.config.options = options;
        this.markDirty();
    }

    /**
     * 渲染组件
     * 处理选项解析、值同步、标签渲染及下拉列表更新
     */
    public render(): void {
        super.render();

        if (!this.inputEl || !this.dropdownEl || !this.inputWrapperEl) {
            return;
        }

        const resolvedOptions = this.resolveOptions();
        this.syncFromExternalValue();

        const selectedKeys = this.getSelectedKeys();
        this.renderTags(selectedKeys, resolvedOptions);

        if (this.config.placeholder !== undefined) {
            // 如果已有选择，placeholder 应该隐藏或者按需展示
            this.inputEl.placeholder = selectedKeys.length > 0 ? '' : this.resolveValue(this.config.placeholder);
        }

        const query = this.getCurrentQuery();
        if (this.inputEl.value !== query) {
            this.inputEl.value = query;
        }

        const filteredOptions = this.filterOptions(query, resolvedOptions);
        this.renderDropdownItems(filteredOptions, selectedKeys);

        this.dropdownEl.style.display = this.isDropdownOpen ? 'block' : 'none';
    }

    /**
     * 销毁组件
     * 移除全局事件监听器并清理资源
     */
    public destroy(): void {
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown);
        }
        super.destroy();
    }

    /** 打开下拉列表 */
    private openDropdown(): void {
        this.isDropdownOpen = true;
    }

    /** 关闭下拉列表 */
    private closeDropdown(): void {
        this.isDropdownOpen = false;
    }

    /** 绑定输入框相关的事件（输入、焦点等） */
    private bindInputEvents(): void {
        this.inputEl.addEventListener('input', () => {
            this.zoneWrapper.run(() => {
                this.state.query = this.inputEl.value;
                this.openDropdown();
                this.config.onSearch?.(this.inputEl.value, this);
                this.markDirty();
            });
        });

        const handleActivate = (event: Event) => {
            this.zoneWrapper.run(() => {
                this.openDropdown();
                this.config.onSearch?.(this.inputEl.value, this);
                this.markDirty();
            });
            event.stopPropagation();
        };

        this.inputEl.addEventListener('focus', handleActivate);
        this.inputWrapperEl.addEventListener('click', () => {
            this.inputEl.focus();
        });
    }

    /** 绑定点击外部关闭下拉列表的事件 */
    private bindDocumentOutsideClick(): void {
        this.onDocumentMouseDown = (event: MouseEvent) => {
            if (!this.isDropdownOpen) return;
            const target = event.target;
            if (!(target instanceof Node)) return;

            if (!this.element.contains(target)) {
                this.zoneWrapper.run(() => {
                    this.closeDropdown();
                    this.state.query = ''; // 关闭时清空查询
                    this.markDirty();
                });
            }
        };
        document.addEventListener('mousedown', this.onDocumentMouseDown);
    }

    private getCurrentQuery(): string {
        return typeof this.state.query === 'string' ? this.state.query : '';
    }

    private getSelectedKeys(): string[] {
        return Array.isArray(this.state.selectedKeys) ? this.state.selectedKeys : [];
    }

    /** 解析当前配置中的选项为具体的值 */
    private resolveOptions(): IResolvedMultiselectOption[] {
        const rawOptions = this.resolveValue(this.config.options) || [];
        const resolved: IResolvedMultiselectOption[] = [];

        for (const item of rawOptions) {
            const keySource = item.key ?? item.value;
            if (keySource === undefined) continue;
            const key = this.resolveValue(keySource);
            const label = this.resolveValue(item.label);
            resolved.push({key, label});
        }
        return resolved;
    }

    /** 从外部配置同步选中状态到内部 state */
    private syncFromExternalValue(): void {
        if (this.config.value === undefined) return;
        const externalValue = this.resolveValue(this.config.value);
        if (Array.isArray(externalValue)) {
            // 这里简单对比，如果长度或内容不同则同步。由于数组可能乱序，严谨点可以排序对比
            const current = this.getSelectedKeys();
            if (JSON.stringify(current) !== JSON.stringify(externalValue)) {
                this.state.selectedKeys = [...externalValue];
            }
        }
    }

    /**
     * 根据查询条件过滤选项
     * @param query 搜索关键词
     * @param options 待过滤的选项列表
     */
    private filterOptions(query: string, options: IResolvedMultiselectOption[]): IResolvedMultiselectOption[] {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return options;

        if (this.config.filter) {
            return options.filter(option => this.config.filter!(query, option));
        }

        return options.filter(option => {
            return option.label.toLowerCase().includes(normalizedQuery)
                || option.key.toLowerCase().includes(normalizedQuery);
        });
    }

    /**
     * 渲染已选中的标签
     * @param selectedKeys 已选中的 key 数组
     * @param options 解析后的选项列表
     */
    private renderTags(selectedKeys: string[], options: IResolvedMultiselectOption[]): void {
        // 清理旧的 tags
        const oldTags = this.inputWrapperEl.querySelectorAll('.ps-multiselect-tag');
        oldTags.forEach(tag => tag.remove());

        selectedKeys.forEach(key => {
            const option = options.find(o => o.key === key);
            if (!option) return;

            const tagEl = document.createElement('span');
            tagEl.className = 'ps-multiselect-tag';
            tagEl.textContent = option.label;

            const closeBtn = document.createElement('span');
            closeBtn.className = 'ps-multiselect-tag-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.zoneWrapper.run(() => {
                    this.toggleSelection(key);
                });
            });

            tagEl.appendChild(closeBtn);
            this.inputWrapperEl.insertBefore(tagEl, this.inputEl);
        });
    }

    /**
     * 渲染下拉列表项
     * @param options 过滤后的选项列表
     * @param selectedKeys 当前选中的 key 数组
     */
    private renderDropdownItems(options: IResolvedMultiselectOption[], selectedKeys: string[]): void {
        this.dropdownEl.innerHTML = '';

        for (const option of options) {
            const itemEl = document.createElement('div');
            const isSelected = selectedKeys.includes(option.key);
            itemEl.className = `ps-multiselect-item${isSelected ? ' selected' : ''}`;
            itemEl.textContent = option.label;

            const checkbox = document.createElement('span');
            checkbox.className = 'ps-multiselect-checkbox';
            itemEl.appendChild(checkbox);

            itemEl.addEventListener('mousedown', (event) => {
                this.zoneWrapper.run(() => {
                    this.toggleSelection(option.key);
                });
                event.preventDefault();
                event.stopPropagation();
            });

            this.dropdownEl.appendChild(itemEl);
        }
    }

    /**
     * 切换某个选项的选中状态
     * @param key 选项的唯一标识
     */
    private toggleSelection(key: string): void {
        console.log('Toggling selection for key:', key);
        let keys = this.getSelectedKeys();
        if (keys.includes(key)) {
            keys = keys.filter(k => k !== key);
        } else {
            keys = [...keys, key];
        }
        this.state.selectedKeys = keys;

        if (this.config.value) {
            this.setValue(this.config.value, keys);
        }

        if (this.config.onSelect) {
            const resolvedOptions = this.resolveOptions();
            const selectedOptions = keys.map(k => resolvedOptions.find(o => o.key === k)!).filter(Boolean);
            this.config.onSelect(selectedOptions, this);
        }

        this.markDirty();
    }
}
