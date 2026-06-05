import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

/**
 * 文本组件配置。
 */
export interface ITextConfig extends IComponentConfig {
    /** 纯文本内容（会写入 textContent）。 */
    text?: DynamicValue<string>;
    /** HTML 内容（会写入 innerHTML，优先级高于 text）。 */
    html?: DynamicValue<string>;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
}

/**
 * 文本展示组件，默认使用 span 元素。
 */
export class Text extends BaseComponent<ITextConfig> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-text';
    }

    /** 创建承载文本的 DOM 元素。 */
    protected createHTMLElement(): HTMLElement {
        return document.createElement('span');
    }

    /**
     * 渲染文本内容。
     * - 若提供 html，优先渲染 html；
     * - 否则渲染 text。
     */
    public render(): void {
        super.render();
        if (this.config.html !== undefined) {
            this.element.innerHTML = this.resolveValue(this.config.html);
        } else if (this.config.text !== undefined) {
            this.element.textContent = this.resolveValue(this.config.text);
        }

        if (this.config.disabled !== undefined) {
            const disabled = !!this.resolveValue(this.config.disabled);
            if (disabled) {
                this.element.style.pointerEvents = 'none';
                this.element.style.opacity = '0.5';
            } else {
                this.element.style.pointerEvents = '';
                this.element.style.opacity = '';
            }
        }
    }
}

/**
 * 标签组件配置。
 */
export interface ILabelConfig extends IComponentConfig {
    /** 标签纯文本内容。 */
    text?: DynamicValue<string>;
    /** 标签 HTML 内容，优先级高于 text。 */
    html?: DynamicValue<string>;
    /** label 的 for 属性值。 */
    for?: string;
}

/**
 * Label 组件，默认渲染为 label 元素。
 */
export class Label extends BaseComponent<ILabelConfig> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-label';
    }

    /** 创建 label 元素并按需设置 for 属性。 */
    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('label');
        if (this.config.for) {
            el.setAttribute('for', this.config.for);
        }
        return el;
    }

    /**
     * 渲染标签内容。
     * - 优先渲染 html；
     * - 未提供 html 时渲染 text。
     */
    public render(): void {
        super.render();
        if (this.config.html !== undefined) {
            this.element.innerHTML = this.resolveValue(this.config.html);
        } else if (this.config.text !== undefined) {
            this.element.textContent = this.resolveValue(this.config.text);
        }
    }
}

/**
 * 按钮组件配置。
 */
export interface IButtonConfig extends IComponentConfig {
    /** 按钮文本。 */
    text: DynamicValue<string>;
    /** 点击回调。 */
    onClick?: (self: Button) => void;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
}

export interface IButtonState {
    text?: string;
}

/**
 * 按钮组件。
 */
export class Button extends BaseComponent<IButtonConfig, IButtonState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-button';
    }

    /**
     * 构造时缓存初始文本到 state，便于后续渲染时优先使用本地状态。
     */
    constructor(config: IButtonConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        if (this.config.text !== undefined) {
            this.state.text = this.resolveValue(this.config.text);
        }
    }

    /**
     * 创建 button 元素并绑定点击事件。
     * 事件通过 zoneWrapper 运行，保持与框架刷新机制一致。
     */
    protected createHTMLElement(): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.addEventListener('click', () => {
            if (!btn.disabled && this.config.onClick) {
                this.zoneWrapper.run(() => {
                    this.config.onClick!(this);
                });
            }
        });
        return btn;
    }

    /** 渲染按钮文本与禁用状态。 */
    public render(): void {
        super.render();
        const text = this.state.text !== undefined ? this.state.text : this.resolveValue(this.config.text);
        this.element.textContent = text;

        if (this.config.disabled !== undefined) {
            (this.element as HTMLButtonElement).disabled = !!this.resolveValue(this.config.disabled);
        }
    }
}


/**
 * 输入框组件配置。
 */
export interface IInputConfig extends IComponentConfig {
    /** 输入值（可双向绑定）。 */
    value?: DynamicValue<string>;
    /** 占位文本。 */
    placeholder?: DynamicValue<string>;
    /** input 类型，默认 text。 */
    type?: string;
    /** input 事件回调。 */
    onInput?: (value: string, self: Input) => void;
    /** change 事件回调。 */
    onChange?: (value: string, self: Input) => void;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
    /** 是否只读。 */
    readOnly?: DynamicValue<boolean>;
}

export interface IInputState {
    value?: string;
}

/**
 * 输入框组件。
 */
export class Input extends BaseComponent<IInputConfig, IInputState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-input';
    }

    /**
     * 创建 input 元素并绑定 input/change 事件。
     * 两类事件都会同步 state，并在可写 DynamicValue 时回写配置值。
     */
    protected createHTMLElement(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = this.config.type || 'text';
        input.addEventListener('input', () => {
            const run = () => {
                this.state.value = input.value;
                if (this.config.value) this.setValue(this.config.value, input.value);
                if (this.config.onInput) this.config.onInput(input.value, this);
            };
            this.zoneWrapper.run(run);
        });
        input.addEventListener('change', () => {
            const run = () => {
                this.state.value = input.value;
                if (this.config.value) this.setValue(this.config.value, input.value);
                if (this.config.onChange) this.config.onChange(input.value, this);
            };
            this.zoneWrapper.run(run);
        });
        return input;
    }

    /**
     * 渲染输入值与占位符。
     * 仅当外部值与当前 DOM 值不一致时更新，避免不必要的光标抖动。
     */
    public render(): void {
        super.render();
        const input = this.element as HTMLInputElement;
        const configVal = this.resolveValue(this.config.value);
        const val = configVal !== undefined ? configVal : this.state.value;

        if (input.value !== val && val !== undefined) {
            input.value = val;
        }
        if (this.config.placeholder !== undefined) {
            input.placeholder = this.resolveValue(this.config.placeholder);
        }

        if (this.config.disabled !== undefined) {
            input.disabled = !!this.resolveValue(this.config.disabled);
        }
        if (this.config.readOnly !== undefined) {
            input.readOnly = !!this.resolveValue(this.config.readOnly);
        }
    }
}

/**
 * 文本域组件配置。
 */
export interface ITextAreaConfig extends IComponentConfig {
    /** 输入值（可双向绑定）。 */
    value?: DynamicValue<string>;
    /** 占位文本。 */
    placeholder?: DynamicValue<string>;
    /** 行数。 */
    rows?: number;
    /** 列数。 */
    cols?: number;
    /** input 事件回调。 */
    onInput?: (value: string, self: TextArea) => void;
    /** change 事件回调。 */
    onChange?: (value: string, self: TextArea) => void;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
    /** 是否只读。 */
    readOnly?: DynamicValue<boolean>;
}

export interface ITextAreaState {
    value?: string;
}

/**
 * 文本域组件。
 */
export class TextArea extends BaseComponent<ITextAreaConfig, ITextAreaState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-textarea';
    }

    /**
     * 创建 textarea 元素并绑定 input/change 事件。
     */
    protected createHTMLElement(): HTMLTextAreaElement {
        const textarea = document.createElement('textarea');
        if (this.config.rows) textarea.rows = this.config.rows;
        if (this.config.cols) textarea.cols = this.config.cols;

        textarea.addEventListener('input', () => {
            const run = () => {
                this.state.value = textarea.value;
                if (this.config.value) this.setValue(this.config.value, textarea.value);
                if (this.config.onInput) this.config.onInput(textarea.value, this);
            };
            this.zoneWrapper.run(run);
        });
        textarea.addEventListener('change', () => {
            const run = () => {
                this.state.value = textarea.value;
                if (this.config.value) this.setValue(this.config.value, textarea.value);
                if (this.config.onChange) this.config.onChange(textarea.value, this);
            };
            this.zoneWrapper.run(run);
        });
        return textarea;
    }

    /**
     * 渲染输入值与占位符。
     */
    public render(): void {
        super.render();
        const textarea = this.element as HTMLTextAreaElement;
        const configVal = this.resolveValue(this.config.value);
        const val = configVal !== undefined ? configVal : this.state.value;

        if (textarea.value !== val && val !== undefined) {
            textarea.value = val;
        }
        if (this.config.placeholder !== undefined) {
            textarea.placeholder = this.resolveValue(this.config.placeholder);
        }

        if (this.config.disabled !== undefined) {
            textarea.disabled = !!this.resolveValue(this.config.disabled);
        }
        if (this.config.readOnly !== undefined) {
            textarea.readOnly = !!this.resolveValue(this.config.readOnly);
        }
    }
}

/**
 * 复选框组件配置。
 */
export interface ICheckboxConfig extends IComponentConfig {
    /** 是否选中。 */
    checked?: DynamicValue<boolean>;
    /** 标签文本。 */
    label?: DynamicValue<string>;
    /** 选中状态变化回调。 */
    onChange?: (checked: boolean, self: Checkbox) => void;
    /** 是否只读。 */
    readOnly?: DynamicValue<boolean>;
}

export interface ICheckboxState {
    checked?: boolean;
}

/**
 * 复选框组件，结构为 label > input[type=checkbox] + span。
 */
export class Checkbox extends BaseComponent<ICheckboxConfig, ICheckboxState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-checkbox';
    }

    /** 内部 checkbox 元素引用。 */
    private inputEl: HTMLInputElement = null as any;
    /** 内部文本 span 元素引用。 */
    private labelEl: HTMLSpanElement = null as any;

    /**
     * 创建复选框结构并绑定 change 事件。
     */
    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('label');

        const inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        const initialChecked = this.resolveValue(this.config.checked);
        if (initialChecked !== undefined) {
            inputEl.checked = !!initialChecked;
        }
        const initialReadOnly = this.resolveValue(this.config.readOnly);
        if (initialReadOnly !== undefined) {
            inputEl.disabled = !!initialReadOnly;
        }
        inputEl.addEventListener('change', () => {
            const run = () => {
                this.state.checked = inputEl.checked;
                if (this.config.checked) this.setValue(this.config.checked, inputEl.checked);
                if (this.config.onChange) this.config.onChange(inputEl.checked, this);
            };
            this.zoneWrapper.run(run);
        });

        this.inputEl = inputEl;
        container.appendChild(inputEl);

        const labelEl = document.createElement('span');
        const initialLabel = this.resolveValue(this.config.label);
        if (initialLabel) {
            labelEl.textContent = String(initialLabel);
        }
        this.labelEl = labelEl;
        container.appendChild(this.labelEl);

        return container;
    }

    /**
     * 渲染选中态与标签文本。
     * 无有效标签内容时隐藏 label span。
     */
    public render(): void {
        super.render();
        if (!this.inputEl) {
            this.inputEl = this.getElement().querySelector('input') as HTMLInputElement;
        }
        if (!this.inputEl) return;

        const checked = this.resolveValue(this.config.checked);
        if (this.inputEl.checked !== !!checked) {
            this.inputEl.checked = !!checked;
        }

        const readOnly = this.resolveValue(this.config.readOnly);
        if (this.inputEl.disabled !== !!readOnly) {
            this.inputEl.disabled = !!readOnly;
        }

        if (!this.labelEl) {
            this.labelEl = this.getElement().querySelector('span') as HTMLSpanElement;
        }
        const labelText = this.resolveValue(this.config.label);
        if (this.labelEl) {
            if (labelText !== undefined && labelText !== null && labelText !== '') {
                this.labelEl.textContent = String(labelText);
                this.labelEl.style.display = '';
            } else {
                this.labelEl.textContent = '';
                this.labelEl.style.display = 'none';
            }
        }
    }
}

/**
 * 单选框组件配置。
 */
export interface IRadioConfig extends IComponentConfig {
    /** 单选组名称。 */
    name: string;
    /** 当前单选项的值。 */
    value: string;
    /** 是否选中。 */
    checked?: DynamicValue<boolean>;
    /** 标签文本。 */
    label?: DynamicValue<string>;
    /** 选中状态变化回调。 */
    onChange?: (checked: boolean, self: Radio) => void;
}

export interface IRadioState {
    checked?: boolean;
}

/**
 * 单选框组件，结构为 label > input[type=radio] + span。
 */
export class Radio extends BaseComponent<IRadioConfig, IRadioState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-radio';
    }

    /** 内部 radio 元素引用。 */
    private inputEl: HTMLInputElement = null as any;
    /** 内部文本 span 元素引用。 */
    private labelEl: HTMLSpanElement = null as any;

    /**
     * 创建单选框结构并绑定 change 事件。
     */
    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('label');

        const inputEl = document.createElement('input');
        inputEl.type = 'radio';
        inputEl.name = this.config.name;
        inputEl.value = this.config.value;
        const initialChecked = this.resolveValue(this.config.checked);
        if (initialChecked !== undefined) {
            inputEl.checked = !!initialChecked;
        }
        inputEl.addEventListener('change', () => {
            const run = () => {
                this.state.checked = inputEl.checked;
                if (this.config.checked) this.setValue(this.config.checked, inputEl.checked);
                if (this.config.onChange) this.config.onChange(inputEl.checked, this);
            };
            this.zoneWrapper.run(run);
        });

        this.inputEl = inputEl;
        container.appendChild(inputEl);

        const labelEl = document.createElement('span');
        const initialLabel = this.resolveValue(this.config.label);
        if (initialLabel) {
            labelEl.textContent = String(initialLabel);
        }
        this.labelEl = labelEl;
        container.appendChild(this.labelEl);

        return container;
    }

    /**
     * 渲染选中态与标签文本。
     * 无有效标签内容时隐藏 label span。
     */
    public render(): void {
        super.render();
        if (!this.inputEl) return;
        const checked = this.resolveValue(this.config.checked);
        if (this.inputEl.checked !== !!checked) {
            this.inputEl.checked = !!checked;
        }

        const labelText = this.resolveValue(this.config.label);
        if (labelText !== undefined && labelText !== null && labelText !== '') {
            this.labelEl.textContent = String(labelText);
            this.labelEl.style.display = '';
        } else {
            this.labelEl.textContent = '';
            this.labelEl.style.display = 'none';
        }
    }
}

/**
 * 下拉选项定义。
 */
export interface ISelectOption {
    /** 展示文本。 */
    label: string;
    /** 实际值。 */
    value: string;
}

/**
 * 下拉框组件配置。
 */
export interface ISelectConfig extends IComponentConfig {
    /** 可选项列表。 */
    options: DynamicValue<ISelectOption[]>;
    /** 当前选中值。 */
    value?: DynamicValue<string>;
    /** 值变化回调。 */
    onChange?: (value: string, self: Select) => void;
}

export interface ISelectState {
    value?: string;
}

/**
 * 下拉框组件。
 */
export class Select extends BaseComponent<ISelectConfig, ISelectState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-select';
    }

    /** 创建 select 元素并绑定 change 事件。 */
    protected createHTMLElement(): HTMLSelectElement {
        const select = document.createElement('select');
        select.addEventListener('change', () => {
            const run = () => {
                this.state.value = select.value;
                if (this.config.value) this.setValue(this.config.value, select.value);
                if (this.config.onChange) this.config.onChange(select.value, this);
            };
            this.zoneWrapper.run(run);
        });
        return select;
    }

    /**
     * 渲染选项与当前值。
     * 这里使用基于数量的简化差异更新策略：仅当长度变化时重建 options。
     */
    public render(): void {
        super.render();
        const select = this.element as HTMLSelectElement;
        const options = this.resolveValue(this.config.options) || [];

        // 仅在选项数量变化时重建，避免每次 render 都清空重绘。
        if (select.options.length !== options.length) {
            select.innerHTML = '';
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.value;
                optionEl.textContent = opt.label;
                select.appendChild(optionEl);
            });
        }

        const val = this.state.value !== undefined ? this.state.value : this.resolveValue(this.config.value);
        if (select.value !== val && val !== undefined) {
            select.value = val;
        }
    }
}

/**
 * 滑块组件配置。
 */
export interface ISliderConfig extends IComponentConfig {
    /** 最小值。 */
    min?: DynamicValue<number>;
    /** 最大值。 */
    max?: DynamicValue<number>;
    /** 步进值。 */
    step?: DynamicValue<number>;
    /** 当前值。 */
    value?: DynamicValue<number>;
    /** 值变化回调。 */
    onChange?: (value: number, self: Slider) => void;
}

export interface ISliderState {
    value?: number;
}

/**
 * 滑块组件，基于 input[type=range]。
 */
export class Slider extends BaseComponent<ISliderConfig, ISliderState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-slider';
    }

    /** 创建 range 输入元素并绑定 input 事件。 */
    protected createHTMLElement(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'range';
        input.addEventListener('input', () => {
            const run = () => {
                const val = parseFloat(input.value);
                this.state.value = val;
                if (this.config.value) this.setValue(this.config.value, val);
                if (this.config.onChange) this.config.onChange(val, this);
            };
            this.zoneWrapper.run(run);
        });
        return input;
    }

    /** 渲染范围参数与当前值。 */
    public render(): void {
        super.render();
        const input = this.element as HTMLInputElement;
        input.min = String(this.resolveValue(this.config.min) ?? 0);
        input.max = String(this.resolveValue(this.config.max) ?? 100);
        input.step = String(this.resolveValue(this.config.step) ?? 1);

        const val = this.state.value !== undefined ? this.state.value : this.resolveValue(this.config.value);
        if (input.value !== String(val) && val !== undefined) {
            input.value = String(val);
        }
    }
}

/**
 * 颜色选择器组件配置。
 */
export interface IColorPickerConfig extends IComponentConfig {
    /** 当前颜色值，例如 #ff0000。 */
    value?: DynamicValue<string>;
    /** 颜色变化回调。 */
    onChange?: (value: string, self: ColorPicker) => void;
}

export interface IColorPickerState {
    value?: string;
}

/**
 * 颜色选择器组件，基于 input[type=color]。
 */
export class ColorPicker extends BaseComponent<IColorPickerConfig, IColorPickerState> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-color-picker';
    }

    /** 创建颜色输入元素并绑定 input 事件。 */
    protected createHTMLElement(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'color';
        input.addEventListener('input', () => {
            const run = () => {
                this.state.value = input.value;
                if (this.config.value) this.setValue(this.config.value, input.value);
                if (this.config.onChange) this.config.onChange(input.value, this);
            };
            this.zoneWrapper.run(run);
        });
        return input;
    }

    /** 渲染颜色值。 */
    public render(): void {
        super.render();
        const input = this.element as HTMLInputElement;
        const val = this.state.value !== undefined ? this.state.value : this.resolveValue(this.config.value);
        if (input.value !== val && val !== undefined) {
            input.value = val;
        }
    }
}

/**
 * 进度条组件配置。
 */
export interface IProgressBarConfig extends IComponentConfig {
    /** 进度值，范围建议为 0~1。 */
    value: DynamicValue<number>; // 0 to 1
    /** 进度条颜色。 */
    color?: DynamicValue<string>;
}

/**
 * 进度条组件。
 */
export class ProgressBar extends BaseComponent<IProgressBarConfig> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-progress-bar';
    }

    /** 内层进度条元素。 */
    private barEl!: HTMLElement;

    /**
     * 创建进度条 DOM 结构：外层容器 + 内层 bar。
     */
    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '10px';
        container.style.backgroundColor = '#eee';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '5px';

        this.barEl = document.createElement('div');
        this.barEl.style.height = '100%';
        this.barEl.style.width = '0%';
        this.barEl.style.backgroundColor = '#4caf50';
        this.barEl.style.transition = 'width 0.2s';

        container.appendChild(this.barEl);
        return container;
    }

    /**
     * 渲染进度条宽度与颜色。
     * 进度会被夹在 0~100 范围内，防止越界。
     */
    public render(): void {
        super.render();
        const val = this.resolveValue(this.config.value);
        const percent = Math.min(100, Math.max(0, val * 100));
        this.barEl.style.width = `${percent}%`;

        const color = this.resolveValue(this.config.color);
        if (color) {
            this.barEl.style.backgroundColor = color;
        }
    }
}
