import {AppRoot} from '../../src/app-root';
import {createZoneWrapper} from '../../src/core';
import {makeDataAccessor} from '../../src/utils';

describe('Basic Components', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('test');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: {mode: 'none'}
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('Label', () => {
        it('should render text content correctly', () => {
            const label = appRoot.add.Label({text: 'Hello World'});
            appRoot.renderAll();
            expect(label.getElement().textContent).toBe('Hello World');
            expect(label.getElement().innerHTML).toBe('Hello World');
        });

        it('should render html content correctly', () => {
            const label = appRoot.add.Label({html: '<b>Bold Text</b>'});
            appRoot.renderAll();
            expect(label.getElement().innerHTML).toBe('<b>Bold Text</b>');
            const boldElement = label.getElement().querySelector('b');
            expect(boldElement).not.toBeNull();
            expect(boldElement?.textContent).toBe('Bold Text');
        });

        it('should prioritize html over text', () => {
            const label = appRoot.add.Label({
                text: 'Plain Text',
                html: '<i>Italic Text</i>'
            });
            appRoot.renderAll();
            expect(label.getElement().innerHTML).toBe('<i>Italic Text</i>');
            expect(label.getElement().textContent).toBe('Italic Text');
        });

        it('should handle for attribute', () => {
            const label = appRoot.add.Label({text: 'Label', for: 'input-id'});
            appRoot.renderAll();
            expect(label.getElement().getAttribute('for')).toBe('input-id');
        });
    });

    describe('Text', () => {
        it('should render text content correctly', () => {
            const text = appRoot.add.Text({text: 'Hello'});
            appRoot.renderAll();
            expect(text.getElement().textContent).toBe('Hello');
        });

        it('should render html content correctly', () => {
            const text = appRoot.add.Text({html: '<span>Nested</span>'});
            appRoot.renderAll();
            expect(text.getElement().innerHTML).toBe('<span>Nested</span>');
        });

        it('should support disabled property', () => {
            const context = {isDisabled: false};
            const text = appRoot.add.Text({
                text: 'Disabled text',
                disabled: makeDataAccessor(context, 'isDisabled')
            });
            appRoot.renderAll();

            const el = text.getElement();
            expect(el.style.pointerEvents).toBe('');
            expect(el.style.opacity).toBe('');

            zoneWrapper.run(() => {
                context.isDisabled = true;
            });
            appRoot.renderAll();
            expect(el.style.pointerEvents).toBe('none');
            expect(el.style.opacity).toBe('0.5');

            zoneWrapper.run(() => {
                context.isDisabled = false;
            });
            appRoot.renderAll();
            expect(el.style.pointerEvents).toBe('');
            expect(el.style.opacity).toBe('');
        });
    });

    describe('Input Two-way Binding', () => {
        it('should update context when input changes', () => {
            const context = {name: 'Alice'};
            const input = appRoot.add.Input({
                value: makeDataAccessor(context, 'name')
            });
            appRoot.renderAll();

            const inputEl = input.getElement() as HTMLInputElement;
            expect(inputEl.value).toBe('Alice');

            inputEl.value = 'Bob';
            inputEl.dispatchEvent(new Event('input'));

            expect(context.name).toBe('Bob');
        });

        it('should support disabled property', () => {
            const context = {isDisabled: false};
            const input = appRoot.add.Input({
                disabled: makeDataAccessor(context, 'isDisabled')
            });
            appRoot.renderAll();

            const el = input.getElement() as HTMLInputElement;
            expect(el.disabled).toBe(false);

            zoneWrapper.run(() => {
                context.isDisabled = true;
            });
            appRoot.renderAll();
            expect(el.disabled).toBe(true);
        });

        it('should support dynamic readOnly property', () => {
            const context = {isReadOnly: false};
            const input = appRoot.add.Input({
                readOnly: makeDataAccessor(context, 'isReadOnly')
            });
            appRoot.renderAll();

            const el = input.getElement() as HTMLInputElement;
            expect(el.readOnly).toBe(false);

            zoneWrapper.run(() => {
                context.isReadOnly = true;
            });
            appRoot.renderAll();
            expect(el.readOnly).toBe(true);

            zoneWrapper.run(() => {
                context.isReadOnly = false;
            });
            appRoot.renderAll();
            expect(el.readOnly).toBe(false);
        });
    });

    describe('Checkbox Two-way Binding', () => {
        it('should update context when checkbox changes', () => {
            const context = {active: false};
            const checkbox = appRoot.add.Checkbox({
                checked: makeDataAccessor(context, 'active')
            });
            appRoot.renderAll();

            const inputEl = checkbox.getElement().querySelector('input') as HTMLInputElement;
            expect(inputEl.checked).toBe(false);

            inputEl.checked = true;
            inputEl.dispatchEvent(new Event('change'));

            expect(context.active).toBe(true);
        });

        it('should support readOnly property', () => {
            const context = {isReadOnly: false};
            const checkbox = appRoot.add.Checkbox({
                readOnly: makeDataAccessor(context, 'isReadOnly')
            });
            appRoot.renderAll();

            const inputEl = checkbox.getElement().querySelector('input') as HTMLInputElement;
            expect(inputEl.disabled).toBe(false);

            zoneWrapper.run(() => {
                context.isReadOnly = true;
            });
            appRoot.renderAll();
            expect(inputEl.disabled).toBe(true);
        });
    });
});
