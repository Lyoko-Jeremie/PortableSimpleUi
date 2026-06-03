import {BaseComponent, IComponentConfig} from '../../component';
import {IZoneWrapper} from '../../core';
import {DynamicValue} from '../../types';

export interface IAutocompleteOption {
    key?: DynamicValue<string>;
    value?: DynamicValue<string>;
    label: DynamicValue<string>;
}

export interface IResolvedAutocompleteOption {
    key: string;
    label: string;
}

export interface IAutocompleteConfig extends IComponentConfig {
    options: DynamicValue<IAutocompleteOption[]>;
    value?: DynamicValue<string>;
    placeholder?: DynamicValue<string>;
    onSearch?: (query: string, self: Autocomplete) => void;
    onSelect?: (option: IResolvedAutocompleteOption, self: Autocomplete) => void;
    filter?: (query: string, option: IResolvedAutocompleteOption) => boolean;
}

export class Autocomplete extends BaseComponent<IAutocompleteConfig> {
    private inputEl: HTMLInputElement = null as any;
    private dropdownEl: HTMLDivElement = null as any;
    private isDropdownOpen = false;
    private onDocumentMouseDown!: (event: MouseEvent) => void;

    constructor(config: IAutocompleteConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        this.inputEl = this.element.querySelector('.ps-autocomplete-input') as HTMLInputElement;
        this.dropdownEl = this.element.querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        this.bindInputEvents();
        this.bindDocumentOutsideClick();

        this.state.query = '';
        this.state.selectedKey = undefined as string | undefined;
    }

    protected getBaseClassName(): string | null {
        return 'ps-autocomplete-container';
    }

    protected createHTMLElement(): HTMLElement {
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
        this.config.options = options;
        this.markDirty();
    }

    public render(): void {
        super.render();

        if (!this.inputEl || !this.dropdownEl) {
            return;
        }

        if (this.config.placeholder !== undefined) {
            this.inputEl.placeholder = this.resolveValue(this.config.placeholder);
        }

        const resolvedOptions = this.resolveOptions();
        this.syncInputFromExternalValue(resolvedOptions);

        const query = this.getCurrentQuery();
        if (this.inputEl.value !== query) {
            this.inputEl.value = query;
        }

        const filteredOptions = this.filterOptions(query, resolvedOptions);
        this.renderDropdownItems(filteredOptions);

        this.dropdownEl.style.display = this.isDropdownOpen ? 'block' : 'none';
    }

    public destroy(): void {
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown);
        }
        super.destroy();
    }

    private openDropdown(): void {
        this.isDropdownOpen = true;
    }

    private bindInputEvents(): void {
        this.inputEl.addEventListener('input', () => {
            this.zoneWrapper.run(() => {
                this.state.query = this.inputEl.value;
                this.state.selectedKey = undefined;
                this.openDropdown();
                this.config.onSearch?.(this.inputEl.value, this);
                this.markDirty();
            });
        });

        const handleActivate = () => {
            this.zoneWrapper.run(() => {
                this.openDropdown();
                this.config.onSearch?.(this.inputEl.value, this);
                this.markDirty();
            });
        };

        this.inputEl.addEventListener('focus', handleActivate);
        this.inputEl.addEventListener('click', handleActivate);
    }

    private bindDocumentOutsideClick(): void {
        this.onDocumentMouseDown = (event: MouseEvent) => {
            if (!this.isDropdownOpen) {
                return;
            }
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }
            if (!this.element.contains(target)) {
                this.zoneWrapper.run(() => {
                    this.closeDropdown();
                    this.markDirty();
                });
            }
        };
        document.addEventListener('mousedown', this.onDocumentMouseDown);
    }

    private closeDropdown(): void {
        this.isDropdownOpen = false;
    }

    private getCurrentQuery(): string {
        const queryState = this.state.query;
        if (typeof queryState === 'string') {
            return queryState;
        }
        return '';
    }

    private resolveOptions(): IResolvedAutocompleteOption[] {
        const rawOptions = this.resolveValue(this.config.options) || [];
        const resolved: IResolvedAutocompleteOption[] = [];

        for (const item of rawOptions) {
            const keySource = item.key ?? item.value;
            if (keySource === undefined) {
                continue;
            }
            const key = this.resolveValue(keySource);
            const label = this.resolveValue(item.label);
            resolved.push({key, label});
        }

        return resolved;
    }

    private syncInputFromExternalValue(options: IResolvedAutocompleteOption[]): void {
        if (this.config.value === undefined) {
            return;
        }

        const externalKey = this.resolveValue(this.config.value);
        if (externalKey.length === 0) {
            return;
        }

        if (this.state.selectedKey === externalKey && this.state.query) {
            return;
        }

        const selectedOption = options.find(option => option.key === externalKey);
        if (!selectedOption) {
            return;
        }

        this.state.selectedKey = externalKey;
        this.state.query = selectedOption.label;
    }

    private filterOptions(query: string, options: IResolvedAutocompleteOption[]): IResolvedAutocompleteOption[] {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return options;
        }

        if (this.config.filter) {
            return options.filter(option => this.config.filter!(query, option));
        }

        return options.filter(option => {
            return option.label.toLowerCase().includes(normalizedQuery)
                || option.key.toLowerCase().includes(normalizedQuery);
        });
    }

    private renderDropdownItems(options: IResolvedAutocompleteOption[]): void {
        this.dropdownEl.innerHTML = '';

        for (const option of options) {
            const itemEl = document.createElement('div');
            itemEl.className = 'ps-autocomplete-item';
            itemEl.textContent = option.label;

            itemEl.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });

            itemEl.addEventListener('click', () => {
                this.zoneWrapper.run(() => {
                    this.state.query = option.label;
                    this.state.selectedKey = option.key;
                    if (this.config.value) {
                        this.setValue(this.config.value, option.key);
                    }
                    this.config.onSelect?.(option, this);
                    this.closeDropdown();
                    this.markDirty();
                });
            });

            this.dropdownEl.appendChild(itemEl);
        }
    }
}



