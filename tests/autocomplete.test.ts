import {AppRoot, createZoneWrapper} from '../src/index';

describe('Autocomplete Component', () => {
    let parent: HTMLElement;

    beforeEach(() => {
        parent = document.createElement('div');
        document.body.appendChild(parent);
    });

    afterEach(() => {
        document.body.removeChild(parent);
    });

    it('should render correctly', () => {
        const zone = createZoneWrapper('test');
        const app = new AppRoot(parent, {
            zoneWrapper: zone,
            styleIsolation: { mode: 'none' }
        });

        const autocomplete = app.add.Autocomplete({
            placeholder: 'Search fruit...',
            options: [
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' }
            ]
        });

        const input = autocomplete.getElement().querySelector('input');
        expect(input).toBeTruthy();
        expect(input?.placeholder).toBe('Search fruit...');
    });

    it('should filter options on input', () => {
        const zone = createZoneWrapper('test');
        const app = new AppRoot(parent, {
            zoneWrapper: zone,
            styleIsolation: { mode: 'none' }
        });

        const autocomplete = app.add.Autocomplete({
            options: [
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' }
            ]
        });

        const input = autocomplete.getElement().querySelector('input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        input.value = 'app';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const items = dropdown.querySelectorAll('.ps-autocomplete-item');
        expect(items.length).toBe(1);
        expect(items[0].textContent).toBe('Apple');
        expect(dropdown.style.display).toBe('block');
    });

    it('should select an option', () => {
        const zone = createZoneWrapper('test');
        const app = new AppRoot(parent, {
            zoneWrapper: zone,
            styleIsolation: { mode: 'none' }
        });

        let selectedValue = '';
        const autocomplete = app.add.Autocomplete({
            options: [
                { label: 'Apple', value: 'apple' }
            ],
            onSelect: (opt) => {
                selectedValue = opt.value;
            }
        });

        const input = autocomplete.getElement().querySelector('input') as HTMLInputElement;
        input.value = 'app';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const item = autocomplete.getElement().querySelector('.ps-autocomplete-item') as HTMLElement;
        item.click();

        expect(input.value).toBe('Apple');
        expect(selectedValue).toBe('apple');
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;
        expect(dropdown.style.display).toBe('none');
    });
});
