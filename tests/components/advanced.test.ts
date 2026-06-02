import {AppRoot} from '../../src/app-root';
import {createZoneWrapper} from '../../src/core';
import {Autocomplete} from '../../src/components/advanced';

describe('Advanced Components - Autocomplete', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('test-advanced');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should trigger onSelect when an option is clicked', (done) => {
        let selectedValue = '';
        const options = ['Apple', 'Banana', 'Cherry'];
        const autocomplete = new Autocomplete({
            options: options,
            onSelect: (val) => {
                selectedValue = val;
            }
        }, zoneWrapper);

        // Manual select
        (autocomplete as any).selectOption('Banana');

        expect(selectedValue).toBe('Banana');
        done();
    });
});
