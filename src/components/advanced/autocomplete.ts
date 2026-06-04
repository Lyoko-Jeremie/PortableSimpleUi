/**
 * ============================================================
 *  Autocomplete 组件 — 架构总览与工作流程
 * ============================================================
 *
 * 一、DOM 结构
 * ─────────────────────────────────────────────────────────
 *   <div class="ps-autocomplete-container">   ← 根节点 (element)
 *     <input class="ps-autocomplete-input">   ← inputEl
 *     <div  class="ps-autocomplete-dropdown"> ← dropdownEl
 *       <div class="ps-autocomplete-item">选项 A</div>
 *       <div class="ps-autocomplete-item">选项 B</div>
 *       ...
 *     </div>
 *   </div>
 *
 *
 * 二、内部状态（state）
 * ─────────────────────────────────────────────────────────
 *   state.query       : string          当前输入框的查询文本
 *   state.selectedKey : string|undefined 当前已选中项的 key
 *   isDropdownOpen    : boolean         下拉是否可见（不进入 state，纯视图标志）
 *
 *
 * 三、数据流向
 * ─────────────────────────────────────────────────────────
 *
 *   外部配置 (config.options / config.value)
 *          │
 *          ▼
 *   ┌─────────────┐   resolveOptions()        ┌───────────────────────┐
 *   │ DynamicValue│ ─────────────────────────▶│ IResolvedAutocomplete │
 *   │  (原始选项)  │                           │   Option[]  (字符串)  │
 *   └─────────────┘                           └──────────┬────────────┘
 *                                                        │
 *              ┌─────────────────────────────────────────┤
 *              │                                         │
 *              ▼                                         ▼
 *   syncInputFromExternalValue()             filterOptions(query, options)
 *   当 config.value 存在时，把外部 key          用 query 对选项做筛选，
 *   映射成对应 label 写入 state.query           支持自定义 filter 函数
 *              │                                         │
 *              └──────────────┬──────────────────────────┘
 *                             │
 *                             ▼
 *                    renderDropdownItems()
 *                    把筛选结果渲染成 DOM 节点
 *
 *
 * 四、交互事件流
 * ─────────────────────────────────────────────────────────
 *
 *   [用户输入 / 聚焦 / 点击输入框]
 *          │
 *          ▼
 *   bindInputEvents()
 *   ├─ input 事件  → 更新 state.query，清空 selectedKey，openDropdown()
 *   │               → 触发 config.onSearch 回调
 *   └─ focus/click  → openDropdown()，触发 config.onSearch 回调
 *          │
 *          ▼
 *       markDirty()  ← 通知调度器：该组件需要重新渲染
 *          │
 *          ▼
 *       render()     ← 父类调度，统一刷新视图
 *
 *   [用户点击某个候选项]
 *          │
 *          ▼
 *   renderDropdownItems() 内部的 click 监听
 *   ├─ 更新 state.query / state.selectedKey
 *   ├─ 调用 setValue() 把 key 写回 config.value（受控模式）
 *   ├─ 触发 config.onSelect 回调
 *   └─ closeDropdown() → markDirty() → render()
 *
 *   [用户点击组件外部]
 *          │
 *          ▼
 *   bindDocumentOutsideClick()
 *   document mousedown 监听：element.contains(target) 为 false 时
 *   └─ closeDropdown() → markDirty() → render()
 *
 *
 * 五、受控模式 vs 非受控模式
 * ─────────────────────────────────────────────────────────
 *
 *   ┌──────────────────┬──────────────────────────────────────────┐
 *   │                  │  非受控 (config.value 未提供)             │
 *   │ 驱动源           │  用户输入直接更新 state.query              │
 *   ├──────────────────┼──────────────────────────────────────────┤
 *   │                  │  受控 (config.value 已提供)               │
 *   │ 驱动源           │  外部 value 变化 → syncInputFromExternal  │
 *   │                  │  Value() 覆盖 state.query / selectedKey   │
 *   └──────────────────┴──────────────────────────────────────────┘
 *
 *
 * 六、生命周期
 * ─────────────────────────────────────────────────────────
 *
 *   constructor()
 *     └─ createHTMLElement()  建立 DOM 骨架
 *     └─ bindInputEvents()    绑定输入框事件
 *     └─ bindDocumentOutsideClick()  绑定全局点击
 *     └─ 初始化 state
 *          │
 *          ▼
 *   render()  (由调度器驱动，可多次调用)
 *     └─ 同步 placeholder / 选项 / query / 下拉可见性
 *          │
 *          ▼
 *   destroy()
 *     └─ 移除 document mousedown 监听，防止内存泄漏
 *     └─ 调用父类 destroy()
 *
 * ============================================================
 */

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

export interface IAutocompleteState {
    query: string;
    selectedKey: string | undefined;
}

// 自动完成组件：负责管理输入框、下拉列表、选项筛选以及外部值同步。
export class Autocomplete extends BaseComponent<IAutocompleteConfig, IAutocompleteState> {
    // 输入框 DOM 节点，构造完成后从根元素中查找并缓存，避免后续重复查询。
    private inputEl: HTMLInputElement = null as any;
    // 下拉容器 DOM 节点，负责承载所有候选项。
    private dropdownEl: HTMLDivElement = null as any;
    // 当前下拉是否处于打开状态：控制 dropdown 的显示/隐藏。
    private isDropdownOpen = false;
    // 记录绑定到 document 上的 mousedown 处理函数，便于销毁时移除事件监听。
    private onDocumentMouseDown!: (event: MouseEvent) => void;

    /**
     * 构造函数：初始化组件。
     *
     * 父类负责调用 `createHTMLElement()` 建立 DOM 骨架，本构造函数在其基础上：
     * 1. 从已建立的 DOM 中查找并缓存 `inputEl`、`dropdownEl` 两个关键节点；
     * 2. 绑定输入框交互事件与全局点击外部关闭事件；
     * 3. 将 `state.query` 和 `state.selectedKey` 初始化为空值。
     *
     * @param config       组件配置，包含选项列表、受控值、回调函数等
     * @param zoneWrapper  变更检测区域包装器，所有状态变更须在其 `run()` 内执行
     */
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
        this.state.selectedKey = undefined;
    }

    /**
     * 返回组件根节点的基础 CSS 类名。
     *
     * 父类会将此值设置到根元素的 `className` 上，
     * 供外部样式表和测试用例通过类名定位组件。
     *
     * @returns 固定返回 `'ps-autocomplete-container'`
     */
    protected getBaseClassName(): string | null {
        // 返回组件根节点的基础 class，便于样式控制与外部定位。
        return 'ps-autocomplete-container';
    }

    /**
     * 构建并返回组件的初始 DOM 结构。
     *
     * 由父类在构造阶段调用一次，生成：
     * - 一个外层容器 `<div>`
     * - 其中包含 `<input>` 输入框（autocomplete 属性关闭，避免浏览器原生提示干扰）
     * - 以及初始隐藏的下拉容器 `<div>`
     *
     * @returns 组件根 DOM 节点
     */
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

    /**
     * 外部更新选项列表的公开接口。
     *
     * 将新的选项列表写入配置后立即调用 `markDirty()`，
     * 通知调度器在下一帧重新执行 `render()` 刷新下拉候选项。
     *
     * @param options 新的选项列表，支持动态值（函数或直接值）
     */
    public setOptions(options: DynamicValue<IAutocompleteOption[]>): void {
        // 外部更新选项后只需要标记组件脏状态，由 render 统一刷新视图。
        this.config.options = options;
        this.markDirty();
    }

    /**
     * 渲染函数：将当前配置与状态同步到 DOM。
     *
     * 由父类调度器在 `markDirty()` 后的下一帧调用，执行顺序为：
     * 1. 调用 `super.render()` 完成父类通用渲染；
     * 2. 同步 `placeholder` 到输入框；
     * 3. 解析动态选项列表 → 同步外部受控值 → 读取当前查询词；
     * 4. 筛选候选项并重新渲染下拉列表；
     * 5. 根据 `isDropdownOpen` 控制下拉可见性。
     */
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

    /**
     * 销毁组件，释放所有外部资源。
     *
     * 移除挂载在 `document` 上的 `mousedown` 全局监听，
     * 防止组件销毁后仍响应事件导致内存泄漏或错误。
     * 最后调用 `super.destroy()` 执行父类清理逻辑。
     */
    public destroy(): void {
        // 销毁时需要移除全局监听，避免内存泄漏以及组件销毁后继续响应事件。
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown);
        }
        // 再调用父类销毁逻辑，释放父类持有的资源。
        super.destroy();
    }

    /**
     * 将下拉状态标记为"打开"。
     *
     * 仅修改 `isDropdownOpen` 标志，不直接操作 DOM；
     * 实际的显示/隐藏由 `render()` 统一处理，保持单向数据流。
     */
    private openDropdown(): void {
        // 仅更新状态，真正的显示由 render 统一控制。
        this.isDropdownOpen = true;
    }

    /**
     * 绑定输入框的所有交互事件。
     *
     * 监听三个事件，统一通过 `zoneWrapper.run()` 触发变更检测：
     * - `input`：用户键入时更新 `state.query`、清空 `selectedKey`、打开下拉并触发 `onSearch`；
     * - `focus`：获得焦点时打开下拉并触发 `onSearch`；
     * - `click`：点击输入框时打开下拉并触发 `onSearch`（与 focus 共用同一处理函数）。
     */
    private bindInputEvents(): void {
        // 输入事件：用户键入内容时，更新查询词、清空已选项，并通知外部执行搜索。
        this.inputEl.addEventListener('input', (event) => {
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
        const handleActivate = (type: string, event: Event) => {
            this.zoneWrapper.run(() => {
                // 激活时直接打开下拉。
                this.openDropdown();
                // 触发搜索回调，允许外部在聚焦时预加载或刷新数据。
                this.config.onSearch?.(this.inputEl.value, this);
                // 触发重新渲染，让下拉内容按当前状态更新。
                this.markDirty();
            });
            event.preventDefault();
        };

        this.inputEl.addEventListener('focus', handleActivate.bind(this, 'focus'));
        this.inputEl.addEventListener('click', handleActivate.bind(this, 'click'));
    }

    /**
     * 在 `document` 上注册全局 `mousedown` 监听，实现"点击外部关闭下拉"的交互。
     *
     * 判断逻辑：
     * 1. 下拉已关闭时直接跳过；
     * 2. 事件目标不是 DOM 节点时跳过；
     * 3. 事件目标不在组件根节点内时，关闭下拉并触发重新渲染。
     *
     * 注意：监听函数被保存在 `this.onDocumentMouseDown` 中，
     * 以便在 `destroy()` 时精确移除，不影响其他全局监听。
     */
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

    /**
     * 将下拉状态标记为"关闭"。
     *
     * 仅修改 `isDropdownOpen` 标志，实际隐藏由 `render()` 负责。
     */
    private closeDropdown(): void {
        // 仅切换状态，视图层由 render 根据状态决定是否显示。
        this.isDropdownOpen = false;
    }

    /**
     * 从 `state` 中安全地读取当前查询词。
     *
     * `state` 是动态对象，`query` 字段不能保证始终为字符串类型；
     * 本方法做类型守卫，确保返回值始终是字符串，避免输入框被写入非字符串值。
     *
     * @returns 当前查询词字符串，若 state 中不存在或类型不符则返回 `''`
     */
    private getCurrentQuery(): string {
        // query 预期是字符串；如果状态中暂时不是字符串，则回退为空字符串，避免污染输入框。
        const queryState = this.state.query;
        if (typeof queryState === 'string') {
            return queryState;
        }
        return '';
    }

    /**
     * 将配置中的原始选项列表解析为统一的字符串结构。
     *
     * 处理逻辑：
     * - 先通过 `resolveValue` 展开 `config.options` 的动态值；
     * - 对每项优先取 `key`，无 `key` 时回退到 `value` 字段以兼容旧数据；
     * - 同时通过 `resolveValue` 展开 `label` 的动态值；
     * - 跳过既无 `key` 也无 `value` 的无效选项。
     *
     * @returns 解析后的选项数组，所有字段均为普通字符串
     */
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

    /**
     * 将外部受控值（`config.value`）同步到组件内部状态与输入框显示文本。
     *
     * 仅在以下全部条件满足时执行同步，避免不必要的覆盖：
     * 1. `config.value` 已配置（受控模式）；
     * 2. 解析后的外部 key 不为空字符串；
     * 3. 当前内部 `selectedKey` 与外部值不一致，或 `query` 为空；
     * 4. 能在已解析的选项列表中找到对应项。
     *
     * @param options 当前已解析的选项列表，用于根据 key 反查 label
     */
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
    }

    /**
     * 根据查询词对选项列表进行筛选，返回匹配的候选项。
     *
     * 筛选优先级：
     * 1. 若查询词为空（含纯空格），直接返回全部选项；
     * 2. 若 `config.filter` 已提供，完全委托给外部自定义逻辑；
     * 3. 默认规则：`label` 或 `key` 中（忽略大小写）包含查询词即视为匹配。
     *
     * @param query   当前用户输入的查询文本
     * @param options 待筛选的已解析选项列表
     * @returns 满足筛选条件的选项数组
     */
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

    /**
     * 将筛选后的选项渲染为下拉列表中的 DOM 节点。
     *
     * 每次调用前先清空容器（`innerHTML = ''`），再按顺序插入新节点；
     * 每个选项节点绑定两个事件：
     * - `mousedown`：阻止默认行为，防止输入框在点击选项时失焦从而触发外部关闭逻辑；
     * - `click`：更新 `state`、写回外部 `value`（受控模式）、触发 `onSelect` 回调，然后关闭下拉。
     *
     * @param options 经过筛选的选项列表，每项都将生成一个可点击的下拉条目
     */
    private renderDropdownItems(options: IResolvedAutocompleteOption[]): void {
        // 每次重新渲染前先清空容器，避免旧节点残留造成重复显示。
        this.dropdownEl.innerHTML = '';

        for (const option of options) {
            // 为每个选项创建一个可点击的下拉项。
            const itemEl = document.createElement('div');
            itemEl.className = 'ps-autocomplete-item';
            itemEl.textContent = option.label;

            // 选中项时同步内部状态、外部 value，并关闭下拉。
            itemEl.addEventListener('mousedown', (event) => {
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
                event.preventDefault();
            });

            // 选中项时同步内部状态、外部 value，并关闭下拉。
            itemEl.addEventListener('click', (event) => {
                event.preventDefault();
            });

            this.dropdownEl.appendChild(itemEl);
        }
    }
}
