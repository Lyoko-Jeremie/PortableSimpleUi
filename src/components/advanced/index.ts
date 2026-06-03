import {BaseComponent, IComponentConfig} from '../../component';
import {IZoneWrapper} from '../../core';
import {DynamicValue} from '../../types';

// 下拉自动完成组件的单个原始配置项：
// - key：用于内部识别和回传的唯一标识，支持动态值
// - value：兼容旧字段或外部传入的别名，未提供 key 时会退化使用它
// - label：展示给用户看的文本，支持动态值
export interface IAutocompleteOption {
    key?: DynamicValue<string>;
    value?: DynamicValue<string>;
    label: DynamicValue<string>;
}

// 解析后的选项结构：在渲染和筛选阶段统一使用字符串，避免每次渲染都重复处理动态值
export interface IResolvedAutocompleteOption {
    key: string;
    label: string;
}

// 自动完成组件的配置：
// - options：选项列表，支持动态值
// - value：外部受控值，通常用于和表单状态同步
// - placeholder：输入框占位文字
// - onSearch：用户输入或聚焦时触发，用于外部执行搜索逻辑
// - onSelect：用户选中选项时触发
// - filter：自定义筛选规则，未提供时使用默认文本匹配
export interface IAutocompleteConfig extends IComponentConfig {
    options: DynamicValue<IAutocompleteOption[]>;
    value?: DynamicValue<string>;
    placeholder?: DynamicValue<string>;
    onSearch?: (query: string, self: Autocomplete) => void;
    onSelect?: (option: IResolvedAutocompleteOption, self: Autocomplete) => void;
    filter?: (query: string, option: IResolvedAutocompleteOption) => boolean;
}

// 自动完成组件：负责管理输入框、下拉列表、选项筛选以及外部值同步。
export class Autocomplete extends BaseComponent<IAutocompleteConfig> {
    // 输入框 DOM 节点，构造完成后从根元素中查找并缓存，避免后续重复查询。
    private inputEl: HTMLInputElement = null as any;
    // 下拉容器 DOM 节点，负责承载所有候选项。
    private dropdownEl: HTMLDivElement = null as any;
    // 当前下拉是否处于打开状态：控制 dropdown 的显示/隐藏。
    private isDropdownOpen = false;
    // 记录绑定到 document 上的 mousedown 处理函数，便于销毁时移除事件监听。
    private onDocumentMouseDown!: (event: MouseEvent) => void;

    constructor(config: IAutocompleteConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        // 组件 DOM 已由父类创建完成，这里直接缓存关键节点，后续渲染和交互都会频繁使用。
        this.inputEl = this.element.querySelector('.ps-autocomplete-input') as HTMLInputElement;
        this.dropdownEl = this.element.querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        // 绑定输入相关事件：输入、聚焦、点击等都会影响候选项显示与搜索回调。
        this.bindInputEvents();
        // 绑定全局点击事件：点击组件外部时自动关闭下拉，提升交互体验。
        this.bindDocumentOutsideClick();

        // 初始化内部状态：query 保存当前输入内容，selectedKey 保存当前选中的选项键值。
        this.state.query = '';
        this.state.selectedKey = undefined as string | undefined;
    }

    protected getBaseClassName(): string | null {
        // 返回组件根节点的基础 class，便于样式控制与外部定位。
        return 'ps-autocomplete-container';
    }

    protected createHTMLElement(): HTMLElement {
        // 先创建容器，再依次创建输入框与下拉容器，最后组合成完整组件 DOM。
        const container = document.createElement('div');

        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.className = 'ps-autocomplete-input';

        const dropdown = document.createElement('div');
        dropdown.className = 'ps-autocomplete-dropdown';
        dropdown.style.display = 'none';

        container.appendChild(input);
        container.appendChild(dropdown);

        return container;
    }

    public setOptions(options: DynamicValue<IAutocompleteOption[]>): void {
        // 外部更新选项后只需要标记组件脏状态，由 render 统一刷新视图。
        this.config.options = options;
        this.markDirty();
    }

    public render(): void {
        // 先交给父类执行基础渲染逻辑，例如应用状态和配置的通用处理。
        super.render();

        // 如果关键 DOM 节点不存在，说明组件尚未正确初始化，直接退出避免报错。
        if (!this.inputEl || !this.dropdownEl) {
            return;
        }

        // 占位文本是可选配置，只有在提供时才写入输入框。
        if (this.config.placeholder !== undefined) {
            this.inputEl.placeholder = this.resolveValue(this.config.placeholder);
        }

        // 将动态选项解析为统一的字符串数组，后续筛选与渲染都使用解析后的结果。
        const resolvedOptions = this.resolveOptions();
        // 如果外部通过 value 控制组件，则把外部值同步到输入框与内部状态中。
        this.syncInputFromExternalValue(resolvedOptions);

        // 当前查询词优先取内部状态，确保用户输入和外部同步都能统一处理。
        const query = this.getCurrentQuery();
        if (this.inputEl.value !== query) {
            // 只有在值不一致时才写回，减少不必要的 DOM 更新。
            this.inputEl.value = query;
        }

        // 根据当前查询词筛选候选项。
        const filteredOptions = this.filterOptions(query, resolvedOptions);
        // 将筛选结果渲染到下拉列表中。
        this.renderDropdownItems(filteredOptions);

        // 根据下拉当前状态控制可见性。
        this.dropdownEl.style.display = this.isDropdownOpen ? 'block' : 'none';
    }

    public destroy(): void {
        // 销毁时需要移除全局监听，避免内存泄漏以及组件销毁后继续响应事件。
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown);
        }
        // 再调用父类销毁逻辑，释放父类持有的资源。
        super.destroy();
    }

    private openDropdown(): void {
        // 仅更新状态，真正的显示由 render 统一控制。
        this.isDropdownOpen = true;
    }

    private bindInputEvents(): void {
        // 输入事件：用户键入内容时，更新查询词、清空已选项，并通知外部执行搜索。
        this.inputEl.addEventListener('input', () => {
            this.zoneWrapper.run(() => {
                // 输入框内容直接作为新的查询词。
                this.state.query = this.inputEl.value;
                // 一旦用户手动输入，之前的选中状态应失效，避免状态与文本不一致。
                this.state.selectedKey = undefined;
                // 输入时打开下拉，以便显示匹配结果。
                this.openDropdown();
                // 触发外部搜索回调，让外部可以根据 query 拉取或过滤数据。
                this.config.onSearch?.(this.inputEl.value, this);
                // 标记需要重新渲染，更新候选项与下拉可见性。
                this.markDirty();
            });
        });

        // 聚焦和点击输入框时，都视为用户希望查看候选项，因此复用同一处理逻辑。
        const handleActivate = () => {
            this.zoneWrapper.run(() => {
                // 激活时直接打开下拉。
                this.openDropdown();
                // 触发搜索回调，允许外部在聚焦时预加载或刷新数据。
                this.config.onSearch?.(this.inputEl.value, this);
                // 触发重新渲染，让下拉内容按当前状态更新。
                this.markDirty();
            });
        };

        this.inputEl.addEventListener('focus', handleActivate);
        this.inputEl.addEventListener('click', handleActivate);
    }

    private bindDocumentOutsideClick(): void {
        // 监听 document 上的 mousedown，用于判断是否点击到了组件外部。
        this.onDocumentMouseDown = (event: MouseEvent) => {
            // 下拉本身已经关闭时，不需要继续做任何判断。
            if (!this.isDropdownOpen) {
                return;
            }

            const target = event.target;
            if (!(target instanceof Node)) {
                // 某些极端情况下事件目标可能不是 Node，直接忽略即可。
                return;
            }

            // 如果点击目标不在组件内部，则关闭下拉并刷新视图。
            if (!this.element.contains(target)) {
                this.zoneWrapper.run(() => {
                    this.closeDropdown();
                    this.markDirty();
                });
            }
        };
        // 将全局监听挂载到 document，确保点击页面任意区域都能被捕获。
        document.addEventListener('mousedown', this.onDocumentMouseDown);
    }

    private closeDropdown(): void {
        // 仅切换状态，视图层由 render 根据状态决定是否显示。
        this.isDropdownOpen = false;
    }

    private getCurrentQuery(): string {
        // query 预期是字符串；如果状态中暂时不是字符串，则回退为空字符串，避免污染输入框。
        const queryState = this.state.query;
        if (typeof queryState === 'string') {
            return queryState;
        }
        return '';
    }

    private resolveOptions(): IResolvedAutocompleteOption[] {
        // 将可能包含动态值的原始选项解析成稳定的字符串数组。
        const rawOptions = this.resolveValue(this.config.options) || [];
        const resolved: IResolvedAutocompleteOption[] = [];

        for (const item of rawOptions) {
            // 优先使用 key；如果没有 key，则使用 value 兼容旧数据结构。
            const keySource = item.key ?? item.value;
            if (keySource === undefined) {
                // 没有可用标识时直接跳过，避免出现无法选择的项。
                continue;
            }

            // 统一把动态值转为字符串，保证后续比较和渲染一致。
            const key = this.resolveValue(keySource);
            const label = this.resolveValue(item.label);
            resolved.push({key, label});
        }

        return resolved;
    }

    private syncInputFromExternalValue(options: IResolvedAutocompleteOption[]): void {
        // 如果没有受控 value，则不做外部同步，完全由用户输入驱动。
        if (this.config.value === undefined) {
            return;
        }

        // 解析外部 value，作为当前应该展示的选中项 key。
        const externalKey = this.resolveValue(this.config.value);
        if (externalKey.length === 0) {
            // 空字符串不视为有效选择，避免把输入框内容强行覆盖成空。
            return;
        }

        // 如果当前内部状态已经与外部值一致，并且已有查询词，则无需重复同步。
        if (this.state.selectedKey === externalKey && this.state.query) {
            return;
        }

        // 根据外部 key 找到对应选项，如果找不到说明外部值与当前选项不匹配。
        const selectedOption = options.find(option => option.key === externalKey);
        if (!selectedOption) {
            return;
        }

        // 将外部受控值同步到内部状态与输入框显示内容。
        this.state.selectedKey = externalKey;
        this.state.query = selectedOption.label;
    }

    private filterOptions(query: string, options: IResolvedAutocompleteOption[]): IResolvedAutocompleteOption[] {
        // 先做统一的文本规范化，忽略前后空格并按小写比较，提高匹配宽容度。
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            // 没有输入时直接返回全部选项，方便用户浏览。
            return options;
        }

        if (this.config.filter) {
            // 如果外部提供了自定义筛选器，则完全交给外部逻辑决定是否显示。
            return options.filter(option => this.config.filter!(query, option));
        }

        // 默认筛选策略：只要 label 或 key 中包含查询词就认为匹配。
        return options.filter(option => {
            return option.label.toLowerCase().includes(normalizedQuery)
                || option.key.toLowerCase().includes(normalizedQuery);
        });
    }

    private renderDropdownItems(options: IResolvedAutocompleteOption[]): void {
        // 每次重新渲染前先清空容器，避免旧节点残留造成重复显示。
        this.dropdownEl.innerHTML = '';

        for (const option of options) {
            // 为每个选项创建一个可点击的下拉项。
            const itemEl = document.createElement('div');
            itemEl.className = 'ps-autocomplete-item';
            itemEl.textContent = option.label;

            // 阻止 mousedown 导致输入框失焦，从而避免点击选项时提前关闭下拉。
            itemEl.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });

            // 选中项时同步内部状态、外部 value，并关闭下拉。
            itemEl.addEventListener('click', () => {
                this.zoneWrapper.run(() => {
                    this.state.query = option.label;
                    this.state.selectedKey = option.key;
                    if (this.config.value) {
                        // 如果配置了受控 value，则把选中的 key 写回外部状态。
                        this.setValue(this.config.value, option.key);
                    }
                    // 通知外部选择结果，方便表单提交或联动更新。
                    this.config.onSelect?.(option, this);
                    // 选择完成后关闭下拉。
                    this.closeDropdown();
                    // 标记脏状态，确保输入框和下拉视觉都刷新到最新值。
                    this.markDirty();
                });
            });

            this.dropdownEl.appendChild(itemEl);
        }
    }
}



