import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';
import {makeDataAccessor} from '../src/utils';
import {IAutocompleteOption} from '../src/components/advanced/index';

describe('Autocomplete', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('autocomplete-test');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: {mode: 'none'}
        });
    });

    afterEach(() => {
        appRoot.destroy();
        document.body.removeChild(container);
    });

    it('opens dropdown with all items when clicking an empty input', () => {
        const autocomplete = appRoot.add.Autocomplete({
            options: [
                {key: 'apple', label: 'Apple'},
                {key: 'banana', label: 'Banana'},
                {key: 'cherry', label: 'Cherry'}
            ]
        });
        appRoot.renderAll();

        const input = autocomplete.getElement().querySelector('.ps-autocomplete-input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        input.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();

        expect(dropdown.style.display).toBe('block');
        expect(dropdown.querySelectorAll('.ps-autocomplete-item').length).toBe(3);
    });

    it('closes dropdown and writes selected option key to output value', () => {
        const model = {selectedKey: ''};
        const onSelect = jest.fn();

        const autocomplete = appRoot.add.Autocomplete({
            value: makeDataAccessor(model, 'selectedKey'),
            options: [
                {key: {value: 'alpha-key'}, label: () => 'Alpha'},
                {key: 'beta-key', label: 'Beta'}
            ],
            onSelect
        });
        appRoot.renderAll();

        const input = autocomplete.getElement().querySelector('.ps-autocomplete-input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        input.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();
        const firstItem = dropdown.querySelector('.ps-autocomplete-item') as HTMLDivElement;
        firstItem.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();

        expect(model.selectedKey).toBe('alpha-key');
        expect(input.value).toBe('Alpha');
        expect(dropdown.style.display).toBe('none');
        expect(onSelect).toHaveBeenCalledWith({key: 'alpha-key', label: 'Alpha'}, autocomplete);
    });

    it('closes dropdown immediately when clicking outside', () => {
        const autocomplete = appRoot.add.Autocomplete({
            options: [
                {key: 'apple', label: 'Apple'},
                {key: 'banana', label: 'Banana'}
            ]
        });
        appRoot.renderAll();

        const input = autocomplete.getElement().querySelector('.ps-autocomplete-input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        input.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();
        expect(dropdown.style.display).toBe('block');

        document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();

        expect(dropdown.style.display).toBe('none');
    });

    it('supports programmatic option updates and dynamic item values', () => {
        const output = {value: ''};
        const optionState: {value: IAutocompleteOption[]; get: () => IAutocompleteOption[]; set: (next: IAutocompleteOption[]) => void} = {
            value: [{key: 'old-1', label: 'Old Option'}],
            get() {
                return this.value;
            },
            set(next: IAutocompleteOption[]) {
                this.value = next;
            }
        };

        const autocomplete = appRoot.add.Autocomplete({
            value: output,
            options: optionState
        });
        appRoot.renderAll();

        autocomplete.setOptions(() => [
            {key: 'new-1', label: () => 'New Option 1'},
            {key: () => 'new-2', label: {value: 'New Option 2'}}
        ]);

        const input = autocomplete.getElement().querySelector('.ps-autocomplete-input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        input.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();
        const items = dropdown.querySelectorAll('.ps-autocomplete-item');

        expect(items.length).toBe(2);
        expect(items[1]?.textContent).toBe('New Option 2');

        (items[1] as HTMLDivElement).dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();
        expect(output.value).toBe('new-2');
    });
});

