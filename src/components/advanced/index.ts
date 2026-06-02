import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue, DataAccessor} from '../../types';
import {IZoneWrapper} from '../../core';

/**
 * Autocomplete 组件配置
 */
export interface IAutocompleteConfig extends IComponentConfig {
    value?: DynamicValue<string> | DataAccessor<string> | undefined;
    options: DynamicValue<string[]> | ((query: string) => Promise<string[]> | string[]);
    placeholder?: DynamicValue<string> | undefined;
    onSelect?: ((value: string, self: Autocomplete) => void) | undefined;
    onChange?: ((value: string, self: Autocomplete) => void) | undefined;
}

export class Autocomplete extends BaseComponent<IAutocompleteConfig> {
    private dropdownElement!: HTMLDivElement;
    private inputElement!: HTMLInputElement;
    private filteredOptions: string[] = [];
    private showDropdown = false;
    private selectedIndex = -1;

    protected getBaseClassName(): string | null {
        return 'ps-autocomplete';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.width = '100%';

        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('ps-input');
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        this.inputElement = input;

        const dropdown = document.createElement('div');
        dropdown.classList.add('ps-dropdown-menu');
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.right = '0';
        dropdown.style.zIndex = '1000';
        dropdown.style.display = 'none';
        dropdown.style.maxHeight = '200px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        this.dropdownElement = dropdown;

        container.appendChild(input);
        container.appendChild(dropdown);

        input.addEventListener('input', () => {
            this.zoneWrapper.run(async () => {
                const query = input.value;
                this.state.value = query;
                if (this.config.onChange) {
                    this.config.onChange(query, this);
                }
                this.setValue(this.config.value!, query);
                await this.updateFilteredOptions(query);
                this.showDropdown = this.filteredOptions.length > 0;
                this.selectedIndex = -1;
                this.render();
            });
        });

        input.addEventListener('focus', () => {
            this.zoneWrapper.run(async () => {
                await this.updateFilteredOptions(input.value);
                this.showDropdown = this.filteredOptions.length > 0;
                this.render();
            });
        });

        input.addEventListener('blur', () => {
            // Delay hide to allow click on dropdown
            setTimeout(() => {
                this.zoneWrapper.run(() => {
                    this.showDropdown = false;
                    this.render();
                });
            }, 200);
        });

        input.addEventListener('keydown', (e) => {
            this.zoneWrapper.run(() => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
                    this.render();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                    this.render();
                } else if (e.key === 'Enter') {
                    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
                        const option = this.filteredOptions[this.selectedIndex];
                        if (option !== undefined) {
                            this.selectOption(option);
                        }
                    }
                } else if (e.key === 'Escape') {
                    this.showDropdown = false;
                    this.render();
                }
            });
        });

        return container;
    }

    private async updateFilteredOptions(query: string) {
        if (typeof this.config.options === 'function') {
            const result = this.config.options(query);
            this.filteredOptions = result instanceof Promise ? await result : result;
        } else {
            const allOptions = this.resolveValue(this.config.options) || [];
            this.filteredOptions = allOptions.filter(opt =>
                opt && opt.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    private selectOption(value: string) {
        this.inputElement.value = value;
        this.state.value = value;
        this.showDropdown = false;
        this.setValue(this.config.value!, value);
        if (this.config.onSelect) {
            this.config.onSelect(value, this);
        }
        if (this.config.onChange) {
            this.config.onChange(value, this);
        }
        this.render();
    }

    public render(): void {
        super.render();
        if (this.inputElement) {
            const val = this.state.value !== undefined ? this.state.value : (this.resolveValue(this.config.value) || '');
            if (this.inputElement.value !== val) {
                this.inputElement.value = val;
            }

            const placeholder = this.resolveValue(this.config.placeholder);
            if (placeholder !== undefined) {
                this.inputElement.placeholder = placeholder;
            }
        }

        if (this.dropdownElement) {
            this.dropdownElement.style.display = this.showDropdown ? 'block' : 'none';
            this.dropdownElement.innerHTML = '';
            this.filteredOptions.forEach((opt, index) => {
                const item = document.createElement('div');
                item.textContent = opt;
                item.style.padding = '8px 12px';
                item.style.cursor = 'pointer';
                if (index === this.selectedIndex) {
                    item.style.backgroundColor = '#e6f7ff';
                }
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = index;
                    this.render();
                });
                item.addEventListener('click', () => {
                    this.selectOption(opt);
                });
                this.dropdownElement.appendChild(item);
            });
        }
    }
}

/**
 * Multiselect 组件配置
 */
export interface IMultiselectConfig extends IComponentConfig {
    value?: DynamicValue<string[]> | DataAccessor<string[]> | undefined;
    options: DynamicValue<{ label: string; value: string }[]>;
    placeholder?: DynamicValue<string> | undefined;
    onChange?: ((value: string[], self: Multiselect) => void) | undefined;
}

export class Multiselect extends BaseComponent<IMultiselectConfig> {
    private containerElement!: HTMLDivElement;
    private selectionContainer!: HTMLDivElement;
    private dropdownElement!: HTMLDivElement;
    private showDropdown = false;

    protected getBaseClassName(): string | null {
        return 'ps-multiselect';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.minHeight = '32px';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '4px';
        container.style.padding = '2px 4px';
        container.style.boxSizing = 'border-box';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '4px';
        container.style.alignItems = 'center';
        this.containerElement = container;

        const selection = document.createElement('div');
        selection.style.display = 'flex';
        selection.style.flexWrap = 'wrap';
        selection.style.gap = '4px';
        this.selectionContainer = selection;
        container.appendChild(selection);

        const dropdown = document.createElement('div');
        dropdown.classList.add('ps-dropdown-menu');
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.right = '0';
        dropdown.style.zIndex = '1000';
        dropdown.style.display = 'none';
        dropdown.style.maxHeight = '200px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        this.dropdownElement = dropdown;
        container.appendChild(dropdown);

        container.addEventListener('click', (e) => {
            if (!this.dropdownElement) return;
            if (e.target === this.dropdownElement || this.dropdownElement.contains(e.target as Node)) {
                return;
            }
            this.zoneWrapper.run(() => {
                this.showDropdown = !this.showDropdown;
                this.render();
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.containerElement || !this.containerElement.contains) return;
            if (!this.containerElement.contains(e.target as Node)) {
                this.zoneWrapper.run(() => {
                    if (this.showDropdown) {
                        this.showDropdown = false;
                        this.render();
                    }
                });
            }
        });

        return this.containerElement;
    }

    private toggleOption(optionValue: string) {
        let currentValues = this.resolveValue(this.config.value) || [];
        if (currentValues.includes(optionValue)) {
            currentValues = currentValues.filter(v => v !== optionValue);
        } else {
            currentValues = [...currentValues, optionValue];
        }
        this.setValue(this.config.value!, currentValues);
        if (this.config.onChange) {
            this.config.onChange(currentValues, this);
        }
        this.render();
    }

    public render(): void {
        super.render();
        const values = this.resolveValue(this.config.value) || [];
        const options = this.resolveValue(this.config.options) || [];

        // Render selected tags
        if (this.selectionContainer) {
            this.selectionContainer.innerHTML = '';
            if (values.length === 0) {
                const placeholder = document.createElement('span');
                placeholder.textContent = this.resolveValue(this.config.placeholder) || 'Select...';
                placeholder.style.color = '#aaa';
                placeholder.style.padding = '4px';
                this.selectionContainer.appendChild(placeholder);
            } else {
                values.forEach(val => {
                    const opt = options.find(o => o.value === val);
                    const tag = document.createElement('div');
                    tag.style.backgroundColor = '#f0f0f0';
                    tag.style.border = '1px solid #ddd';
                    tag.style.borderRadius = '2px';
                    tag.style.padding = '0 6px';
                    tag.style.display = 'flex';
                    tag.style.alignItems = 'center';
                    tag.style.fontSize = '12px';

                    const text = document.createElement('span');
                    text.textContent = opt ? opt.label : val;
                    tag.appendChild(text);

                    const removeBtn = document.createElement('span');
                    removeBtn.textContent = '×';
                    removeBtn.style.marginLeft = '4px';
                    removeBtn.style.cursor = 'pointer';
                    removeBtn.style.fontWeight = 'bold';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.zoneWrapper.run(() => {
                            this.toggleOption(val);
                        });
                    });
                    tag.appendChild(removeBtn);

                    this.selectionContainer.appendChild(tag);
                });
            }
        }

        // Render dropdown
        if (this.dropdownElement) {
            this.dropdownElement.style.display = this.showDropdown ? 'block' : 'none';
            this.dropdownElement.innerHTML = '';
            options.forEach(opt => {
                const item = document.createElement('div');
                item.style.padding = '8px 12px';
                item.style.cursor = 'pointer';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';

                const label = document.createElement('span');
                label.textContent = opt.label;
                item.appendChild(label);

                if (values.includes(opt.value)) {
                    item.style.backgroundColor = '#e6f7ff';
                    const check = document.createElement('span');
                    check.textContent = '✓';
                    item.appendChild(check);
                }

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.zoneWrapper.run(() => {
                        this.toggleOption(opt.value);
                    });
                });

                this.dropdownElement.appendChild(item);
            });
        }
    }
}

/**
 * Linked Multiselect 组件配置
 */
export interface ILinkedMultiselectConfig extends IComponentConfig {
    /**
     * 第一级的配置
     */
    primary: {
        value?: DynamicValue<string> | DataAccessor<string>;
        options: DynamicValue<{ label: string; value: string }[]>;
        placeholder?: DynamicValue<string>;
        onChange?: (value: string, self: LinkedMultiselect) => void;
    };
    /**
     * 第二级的配置，根据第一级的值动态获取
     */
    secondary: {
        value?: DynamicValue<string[]> | DataAccessor<string[]>;
        options: (primaryValue: string) => DynamicValue<{ label: string; value: string }[]>;
        placeholder?: DynamicValue<string>;
        onChange?: (values: string[], self: LinkedMultiselect) => void;
    };
}

export class LinkedMultiselect extends BaseComponent<ILinkedMultiselectConfig> {
    private primarySelect!: HTMLSelectElement;
    private secondaryContainer!: HTMLDivElement;
    private secondaryMultiselect?: Multiselect | undefined;

    protected getBaseClassName(): string | null {
        return 'ps-linked-multiselect';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';

        const select = document.createElement('select');
        select.classList.add('ps-select');
        select.style.width = '100%';
        this.primarySelect = select;

        const secondary = document.createElement('div');
        this.secondaryContainer = secondary;

        container.appendChild(select);
        container.appendChild(secondary);

        select.addEventListener('change', () => {
            this.zoneWrapper.run(() => {
                const val = select.value;
                this.setValue(this.config.primary.value!, val);

                // Reset secondary value when primary changes
                this.setValue(this.config.secondary.value!, []);

                if (this.config.primary.onChange) {
                    this.config.primary.onChange(val, this);
                }
                this.render();
            });
        });

        return container;
    }

    public render(): void {
        super.render();
        if (this.primarySelect) {
            const primaryVal = this.resolveValue(this.config.primary.value) || '';
            const primaryOptions = this.resolveValue(this.config.primary.options) || [];

            // Render primary select
            this.primarySelect.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = this.resolveValue(this.config.primary.placeholder) || 'Select Category...';
            defaultOpt.disabled = true;
            defaultOpt.selected = primaryVal === '';
            this.primarySelect.appendChild(defaultOpt);

            primaryOptions.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.value;
                o.textContent = opt.label;
                o.selected = opt.value === primaryVal;
                this.primarySelect.appendChild(o);
            });

            // Render secondary multiselect
            if (primaryVal) {
                const secondaryOptions = this.config.secondary.options(primaryVal);
                if (!this.secondaryMultiselect) {
                    this.secondaryContainer.innerHTML = '';
                    const config: IMultiselectConfig = {
                        value: this.config.secondary.value,
                        options: secondaryOptions,
                        placeholder: this.config.secondary.placeholder,
                        onChange: (vals) => {
                            if (this.config.secondary.onChange) {
                                this.config.secondary.onChange(vals, this);
                            }
                        }
                    };
                    this.secondaryMultiselect = new Multiselect(config, this.zoneWrapper);
                    this.secondaryContainer.appendChild(this.secondaryMultiselect.getElement());
                } else {
                    // Update existing multiselect config
                    this.secondaryMultiselect.config.options = secondaryOptions;
                    this.secondaryMultiselect.render();
                }
            } else {
                this.secondaryContainer.innerHTML = '';
                this.secondaryMultiselect = undefined;
            }
        }
    }
}
