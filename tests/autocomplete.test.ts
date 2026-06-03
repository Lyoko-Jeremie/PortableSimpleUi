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

    it('should update value when using { value: T } pattern (Bug 1)', () => {
        const zone = createZoneWrapper('test');
        const app = new AppRoot(parent, {
            zoneWrapper: zone,
            styleIsolation: { mode: 'none' }
        });

        // Simulate a simple value holder without a set() method
        const valueHolder = { value: '' };

        const autocomplete = app.add.Autocomplete({
            value: valueHolder,
            options: [
                { label: 'Cherry', value: 'cherry' }
            ]
        });

        const input = autocomplete.getElement().querySelector('input') as HTMLInputElement;
        input.value = 'ch';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const item = autocomplete.getElement().querySelector('.ps-autocomplete-item') as HTMLElement;
        item.click();

        // Value should be updated to the selected option's label
        expect(valueHolder.value).toBe('Cherry');
        expect(input.value).toBe('Cherry');
    });

    it('should keep dropdown closed after selecting async option (Bug 2)', (done) => {
        const zone = createZoneWrapper('test');
        const app = new AppRoot(parent, {
            zoneWrapper: zone,
            styleIsolation: { mode: 'none' }
        });

        const asyncOptions = {
            value: [] as { label: string; value: any }[],
            get() { return this.value; },
            set(v: any) { this.value = v; }
        };

        let searchCount = 0;
        const autocomplete = app.add.Autocomplete({
            options: asyncOptions,
            onSearch: (query) => {
                searchCount++;
                // Simulate async loading
                setTimeout(() => {
                    if (query === 'ch') {
                        asyncOptions.set([
                            { label: 'Cherry', value: 'cherry' }
                        ]);
                    } else {
                        asyncOptions.set([]);
                    }
                    app.markDirty();
                }, 10);
            }
        });

        const input = autocomplete.getElement().querySelector('input') as HTMLInputElement;
        const dropdown = autocomplete.getElement().querySelector('.ps-autocomplete-dropdown') as HTMLDivElement;

        // Type to trigger async search
        input.value = 'ch';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Wait for async options to load and dropdown to appear
        setTimeout(() => {
            expect(dropdown.style.display).toBe('block');
            const item = dropdown.querySelector('.ps-autocomplete-item') as HTMLElement;
            expect(item).toBeTruthy();

            const searchCountBeforeClick = searchCount;
            item.click();

            // Dropdown should be hidden immediately
            expect(dropdown.style.display).toBe('none');

            // Wait for any async callbacks that might fire after click
            setTimeout(() => {
                // Dropdown should STILL be hidden (Bug 2: was re-opening)
                expect(dropdown.style.display).toBe('none');
                // onSearch should NOT have been called again from the programmatic input change
                expect(searchCount).toBe(searchCountBeforeClick);
                done();
            }, 50);
        }, 20);
    });
});
