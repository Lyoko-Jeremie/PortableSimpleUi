import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

export interface ITextConfig extends IComponentConfig {
    text?: DynamicValue<string>;
    html?: DynamicValue<string>;
}

export class Text extends BaseComponent<ITextConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-text';
    }

    protected createHTMLElement(): HTMLElement {
        return document.createElement('span');
    }

    public render(): void {
        super.render();
        if (this.config.html !== undefined) {
            this.element.innerHTML = this.resolveValue(this.config.html);
        } else if (this.config.text !== undefined) {
            this.element.textContent = this.resolveValue(this.config.text);
        }
    }
}

export interface ILabelConfig extends IComponentConfig {
    text?: DynamicValue<string>;
    html?: DynamicValue<string>;
    for?: string;
}

export class Label extends BaseComponent<ILabelConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-label';
    }

    protected createHTMLElement(): HTMLElement {
        const el = document.createElement('label');
        if (this.config.for) {
            el.setAttribute('for', this.config.for);
        }
        return el;
    }

    public render(): void {
        super.render();
        if (this.config.html !== undefined) {
            this.element.innerHTML = this.resolveValue(this.config.html);
        } else if (this.config.text !== undefined) {
            this.element.textContent = this.resolveValue(this.config.text);
        }
    }
}

export interface IButtonConfig extends IComponentConfig {
    text: DynamicValue<string>;
    onClick?: (self: Button) => void;
    disabled?: DynamicValue<boolean>;
}

export class Button extends BaseComponent<IButtonConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-button';
    }

    constructor(config: IButtonConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        if (this.config.text !== undefined) {
            this.state.text = this.resolveValue(this.config.text);
        }
    }

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

    public render(): void {
        super.render();
        const text = this.state.text !== undefined ? this.state.text : this.resolveValue(this.config.text);
        this.element.textContent = text;

        if (this.config.disabled !== undefined) {
            (this.element as HTMLButtonElement).disabled = !!this.resolveValue(this.config.disabled);
        }
    }
}

export interface IImageConfig extends IComponentConfig {
    src: DynamicValue<string>;
    alt?: DynamicValue<string>;
    width?: DynamicValue<string | number>;
    height?: DynamicValue<string | number>;
}

export class Image extends BaseComponent<IImageConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-image';
    }

    protected createHTMLElement(): HTMLImageElement {
        return document.createElement('img');
    }

    public render(): void {
        super.render();
        const img = this.element as HTMLImageElement;
        img.src = this.resolveValue(this.config.src);
        if (this.config.alt !== undefined) img.alt = this.resolveValue(this.config.alt);
        if (this.config.width !== undefined) img.style.width = String(this.resolveValue(this.config.width));
        if (this.config.height !== undefined) img.style.height = String(this.resolveValue(this.config.height));
    }
}

export interface IInputConfig extends IComponentConfig {
    value?: DynamicValue<string>;
    placeholder?: DynamicValue<string>;
    type?: string;
    onInput?: (value: string, self: Input) => void;
    onChange?: (value: string, self: Input) => void;
}

export class Input extends BaseComponent<IInputConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-input';
    }

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

    public render(): void {
        super.render();
        const input = this.element as HTMLInputElement;
        const val = this.state.value !== undefined ? this.state.value : this.resolveValue(this.config.value);
        if (input.value !== val && val !== undefined) {
            input.value = val;
        }
        if (this.config.placeholder !== undefined) {
            input.placeholder = this.resolveValue(this.config.placeholder);
        }
    }
}

export interface ICheckboxConfig extends IComponentConfig {
    checked?: DynamicValue<boolean>;
    label?: DynamicValue<string>;
    onChange?: (checked: boolean, self: Checkbox) => void;
}

export class Checkbox extends BaseComponent<ICheckboxConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-checkbox';
    }

    private inputEl: HTMLInputElement = null as any;
    private labelEl: HTMLSpanElement = null as any;

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('label');

        const inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
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

    public render(): void {
        const labelText = this.resolveValue(this.config.label);
        super.render();
        if (!this.inputEl) return;
        const checked = this.state.checked !== undefined ? this.state.checked : this.resolveValue(this.config.checked);
        if (this.inputEl.checked !== !!checked) {
            this.inputEl.checked = !!checked;
        }

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

export interface IRadioConfig extends IComponentConfig {
    name: string;
    value: string;
    checked?: DynamicValue<boolean>;
    label?: DynamicValue<string>;
    onChange?: (checked: boolean, self: Radio) => void;
}

export class Radio extends BaseComponent<IRadioConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-radio';
    }

    private inputEl: HTMLInputElement = null as any;
    private labelEl: HTMLSpanElement = null as any;

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('label');

        const inputEl = document.createElement('input');
        inputEl.type = 'radio';
        inputEl.name = this.config.name;
        inputEl.value = this.config.value;
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

    public render(): void {
        super.render();
        if (!this.inputEl) return;
        const checked = this.state.checked !== undefined ? this.state.checked : this.resolveValue(this.config.checked);
        if (this.inputEl.checked !== !!checked) {
            this.inputEl.checked = !!checked;
        }

        const labelText = this.resolveValue(this.config.label);
        console.log('Radio render, labelText:', labelText);
        if (labelText !== undefined && labelText !== null && labelText !== '') {
            this.labelEl.textContent = String(labelText);
            this.labelEl.style.display = '';
        } else {
            this.labelEl.textContent = '';
            this.labelEl.style.display = 'none';
        }
    }
}

export interface ISelectOption {
    label: string;
    value: string;
}

export interface ISelectConfig extends IComponentConfig {
    options: DynamicValue<ISelectOption[]>;
    value?: DynamicValue<string>;
    onChange?: (value: string, self: Select) => void;
}

export class Select extends BaseComponent<ISelectConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-select';
    }

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

    public render(): void {
        super.render();
        const select = this.element as HTMLSelectElement;
        const options = this.resolveValue(this.config.options) || [];

        // Simple diff for options
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

export interface ISliderConfig extends IComponentConfig {
    min?: DynamicValue<number>;
    max?: DynamicValue<number>;
    step?: DynamicValue<number>;
    value?: DynamicValue<number>;
    onChange?: (value: number, self: Slider) => void;
}

export class Slider extends BaseComponent<ISliderConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-slider';
    }

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

export interface IColorPickerConfig extends IComponentConfig {
    value?: DynamicValue<string>;
    onChange?: (value: string, self: ColorPicker) => void;
}

export class ColorPicker extends BaseComponent<IColorPickerConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-color-picker';
    }

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

    public render(): void {
        super.render();
        const input = this.element as HTMLInputElement;
        const val = this.state.value !== undefined ? this.state.value : this.resolveValue(this.config.value);
        if (input.value !== val && val !== undefined) {
            input.value = val;
        }
    }
}

export interface IProgressBarConfig extends IComponentConfig {
    value: DynamicValue<number>; // 0 to 1
    color?: DynamicValue<string>;
}

export class ProgressBar extends BaseComponent<IProgressBarConfig> {
    protected getBaseClassName(): string | null {
        return 'ps-progress-bar';
    }

    private barEl!: HTMLElement;

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
