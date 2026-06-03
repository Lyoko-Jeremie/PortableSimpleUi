import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

export interface IAutocompleteOption {
    label: string;
    value: any;
}

export interface IAutocompleteConfig extends IComponentConfig {
    value?: DynamicValue<string>;
    placeholder?: DynamicValue<string>;
    options?: DynamicValue<IAutocompleteOption[]>;
    /**
     * 当输入框内容改变时触发。如果提供，可以用于异步加载选项。
     */
    onSearch?: (query: string) => void;
    /**
     * 当用户选择一个选项时触发。
     */
    onSelect?: (option: IAutocompleteOption, self: Autocomplete) => void;
    /**
     * 当值改变时触发。
     */
    onChange?: (value: string, self: Autocomplete) => void;
}

export class Autocomplete extends BaseComponent<IAutocompleteConfig> {
    // 使用 declare 避免 useDefineForClassFields 将字段覆盖为 undefined（这些字段在 createHTMLElement 中初始化）
    private declare inputElement: HTMLInputElement;
    private declare dropdownElement: HTMLDivElement;
    private isOpen: boolean = false;
    private filteredOptions: IAutocompleteOption[] = [];
    private currentQuery: string = '';
    /** 标记正在执行选项选择，防止 handleInput 再次触发 onSearch 导致下拉菜单重新打开 */
    private isSelecting: boolean = false;
    /** 标记刚刚完成了选项选择，防止紧随其后的 render 周期重新打开下拉菜单 */
    private justSelected: boolean = false;

    protected getBaseClassName(): string {
        return 'ps-autocomplete';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.classList.add('ps-autocomplete-container');

        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('ps-autocomplete-input');

        input.placeholder = this.resolveValue(this.config.placeholder || '');
        const val = this.resolveValue(this.config.value || '');
        input.value = val;

        const dropdown = document.createElement('div');
        dropdown.classList.add('ps-autocomplete-dropdown');
        dropdown.style.display = 'none';

        container.appendChild(input);
        container.appendChild(dropdown);

        this.inputElement = input;
        this.dropdownElement = dropdown;

        input.addEventListener('input', this.zoneWrapper.wrapInZone(() => {
            this.handleInput(input.value);
        }));

        input.addEventListener('focus', this.zoneWrapper.wrapInZone(() => {
            this.updateFilteredOptions(this.currentQuery);
        }));

        document.addEventListener('mousedown', this.zoneWrapper.wrapInZone((e) => {
            if (!container.contains(e.target as Node)) {
                this.hideDropdown();
            }
        }));

        return container;
    }

    private handleInput(query: string) {
        this.currentQuery = query;
        this.justSelected = false;

        if (this.config.value) {
            this.setValue(this.config.value, query);
        }

        // 选择选项触发的 input 事件不应再次触发 onSearch（避免异步回调重新打开下拉菜单）
        if (this.isSelecting) {
            return;
        }

        if (this.config.onSearch) {
            this.config.onSearch(query);
        } else {
            this.updateFilteredOptions(query);
        }

        if (this.config.onChange) {
            this.config.onChange(query, this);
        }
    }

    private updateFilteredOptions(query: string) {
        const options = this.resolveValue(this.config.options || []);
        if (!query) {
            this.filteredOptions = [...options];
        } else {
            this.filteredOptions = options.filter(opt =>
                opt.label.toLowerCase().includes(query.toLowerCase())
            );
        }

        this.dropdownElement.innerHTML = '';
        if (this.filteredOptions.length > 0) {
            this.filteredOptions.forEach(option => {
                const item = document.createElement('div');
                item.classList.add('ps-autocomplete-item');
                item.textContent = option.label;
                item.addEventListener('click', () => {
                    this.selectOption(option);
                });
                this.dropdownElement.appendChild(item);
            });
            this.dropdownElement.style.display = 'block';
            this.isOpen = true;
        } else {
            this.dropdownElement.style.display = 'none';
            this.isOpen = false;
        }
    }

    private showDropdown() {
        this.dropdownElement.style.display = 'block';
        this.isOpen = true;
    }

    private hideDropdown() {
        this.dropdownElement.style.display = 'none';
        this.isOpen = false;
    }

    private renderDropdown() {
        if (!this.dropdownElement) return;
        this.dropdownElement.innerHTML = '';
        if (this.filteredOptions.length === 0) {
            this.hideDropdown();
            return;
        }

        this.filteredOptions.forEach(option => {
            const item = document.createElement('div');
            item.classList.add('ps-autocomplete-item');
            item.textContent = option.label;
            item.addEventListener('click', () => {
                this.selectOption(option);
            });
            this.dropdownElement.appendChild(item);
        });
    }

    private selectOption(option: IAutocompleteOption) {
        this.isSelecting = true;
        this.inputElement.value = option.label;
        if (this.config.value) {
            this.setValue(this.config.value, option.label);
        }
        this.isSelecting = false;
        this.justSelected = true;
        this.hideDropdown();

        if (this.config.onSelect) {
            this.config.onSelect(option, this);
        }
        if (this.config.onChange) {
            this.config.onChange(option.label, this);
        }
    }

    public render(): void {
        super.render();
        if (!this.inputElement) return;
        // 仅在显式配置了 value 时才同步 input 的值（避免覆盖用户选择）
        if (this.config.value !== undefined) {
            const val = this.resolveValue(this.config.value);
            if (this.inputElement.value !== val) {
                this.inputElement.value = val;
            }
        }
        this.inputElement.placeholder = this.resolveValue(this.config.placeholder || '');

        // Re-sync options from signal (critical for async mode where options change after render)
        // Skip during selection or immediately after selection to prevent re-opening the dropdown
        if (this.config.onSearch && !this.isSelecting && !this.justSelected) {
            this.updateFilteredOptions(this.currentQuery);
        }
        this.justSelected = false;
    }
}
