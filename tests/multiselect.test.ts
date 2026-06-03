import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';
import {makeDataAccessor} from '../src/utils';

describe('Multiselect', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('multiselect-test');

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

    it('opens dropdown and shows all options on click', () => {
        const multiselect = appRoot.add.Multiselect({
            options: [
                {key: '1', label: 'Option 1'},
                {key: '2', label: 'Option 2'}
            ]
        });
        appRoot.renderAll();

        const wrapper = multiselect.getElement().querySelector('.ps-multiselect-input-wrapper') as HTMLDivElement;
        const dropdown = multiselect.getElement().querySelector('.ps-multiselect-dropdown') as HTMLDivElement;

        wrapper.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();

        expect(dropdown.style.display).toBe('block');
        expect(dropdown.querySelectorAll('.ps-multiselect-item').length).toBe(2);
    });

    it('toggles selection when clicking items', () => {
        const model = {selected: [] as string[]};
        const multiselect = appRoot.add.Multiselect({
            value: makeDataAccessor(model, 'selected'),
            options: [
                {key: '1', label: 'Option 1'},
                {key: '2', label: 'Option 2'}
            ]
        });
        appRoot.renderAll();

        const dropdown = multiselect.getElement().querySelector('.ps-multiselect-dropdown') as HTMLDivElement;
        const items = dropdown.querySelectorAll('.ps-multiselect-item');

        // Click first item
        (items[0] as HTMLElement).dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();
        expect(model.selected).toEqual(['1']);

        // Click second item
        (items[1] as HTMLElement).dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();
        expect(model.selected).toEqual(['1', '2']);

        // Unclick first item
        (items[0] as HTMLElement).dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        appRoot.renderAll();
        expect(model.selected).toEqual(['2']);
    });

    it('renders tags for selected items', () => {
        const multiselect = appRoot.add.Multiselect({
            value: ['1'],
            options: [
                {key: '1', label: 'Option 1'},
                {key: '2', label: 'Option 2'}
            ]
        });
        appRoot.renderAll();

        const tags = multiselect.getElement().querySelectorAll('.ps-multiselect-tag');
        expect(tags.length).toBe(1);
        expect(tags[0].textContent).toContain('Option 1');
    });

    it('removes selection when clicking tag close button', () => {
        const model = {selected: ['1', '2']};
        const multiselect = appRoot.add.Multiselect({
            value: makeDataAccessor(model, 'selected'),
            options: [
                {key: '1', label: 'Option 1'},
                {key: '2', label: 'Option 2'}
            ]
        });
        appRoot.renderAll();

        const closeBtn = multiselect.getElement().querySelector('.ps-multiselect-tag-close') as HTMLElement;
        closeBtn.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        appRoot.renderAll();

        expect(model.selected).toEqual(['2']);
    });
});
