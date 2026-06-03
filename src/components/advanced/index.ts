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
    private inputElement!: HTMLInputElement;
    private dropdownElement!: HTMLDivElement;
    private isOpen: boolean = false;
    private filteredOptions: IAutocompleteOption[] = [];
    private currentQuery: string = '';

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

        if (this.config.value) {
            this.setValue(this.config.value, query);
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

        const dropdown = this.element.querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;
        if (dropdown) {
            dropdown.innerHTML = '';
            if (this.filteredOptions.length > 0) {
                this.filteredOptions.forEach(option => {
                    const item = document.createElement('div');
                    item.classList.add('ps-autocomplete-item');
                    item.textContent = option.label;
                    item.addEventListener('click', () => {
                        this.selectOption(option);
                    });
                    dropdown.appendChild(item);
                });
                dropdown.style.display = 'block';
                this.isOpen = true;
            } else {
                dropdown.style.display = 'none';
                this.isOpen = false;
            }
        }
    }

    private showDropdown() {
        const dropdown = this.element.querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;
        if (dropdown) {
            dropdown.style.display = 'block';
        }
        this.isOpen = true;
    }

    private hideDropdown() {
        const dropdown = this.element.querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;
        if (dropdown) {
            dropdown.style.display = 'none';
        }
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
        const input = this.element.querySelector('input');
        if (input) {
            input.value = option.label;
        }
        if (this.config.value) {
            this.setValue(this.config.value, option.label);
        }
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
        const val = this.resolveValue(this.config.value || '');
        if (this.inputElement.value !== val) {
            this.inputElement.value = val;
        }
        this.inputElement.placeholder = this.resolveValue(this.config.placeholder || '');

        // Re-sync options from signal (critical for async mode where options change after render)
        if (this.config.onSearch) {
            this.updateFilteredOptions(this.currentQuery);
        }
    }
}
