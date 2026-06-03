import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';
import {makeDataAccessor} from '../src/utils';

describe('TextArea Component', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('test');

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

    it('should render textarea correctly', () => {
        const textArea = appRoot.add.TextArea({
            value: 'Initial value',
            placeholder: 'Hint',
            rows: 5,
            cols: 30
        });
        appRoot.renderAll();

        const el = textArea.getElement() as HTMLTextAreaElement;
        expect(el.tagName.toLowerCase()).toBe('textarea');
        expect(el.value).toBe('Initial value');
        expect(el.placeholder).toBe('Hint');
        expect(el.rows).toBe(5);
        expect(el.cols).toBe(30);
    });

    it('should support two-way binding', () => {
        const context = { text: 'Hello' };
        const textArea = appRoot.add.TextArea({
            value: makeDataAccessor(context, 'text')
        });
        appRoot.renderAll();

        const el = textArea.getElement() as HTMLTextAreaElement;
        expect(el.value).toBe('Hello');

        el.value = 'World';
        el.dispatchEvent(new Event('input'));
        expect(context.text).toBe('World');

        zoneWrapper.run(() => {
            context.text = 'New Value';
        });
        appRoot.renderAll();
        expect(el.value).toBe('New Value');
    });

    it('should trigger onInput and onChange events', () => {
        let inputVal = '';
        let changeVal = '';
        const textArea = appRoot.add.TextArea({
            onInput: (v) => inputVal = v,
            onChange: (v) => changeVal = v
        });
        appRoot.renderAll();

        const el = textArea.getElement() as HTMLTextAreaElement;
        el.value = 'Testing';
        
        el.dispatchEvent(new Event('input'));
        expect(inputVal).toBe('Testing');

        el.dispatchEvent(new Event('change'));
        expect(changeVal).toBe('Testing');
    });

    it('should support disabled property', () => {
        const context = { isDisabled: false };
        const textArea = appRoot.add.TextArea({
            disabled: makeDataAccessor(context, 'isDisabled')
        });
        appRoot.renderAll();

        const el = textArea.getElement() as HTMLTextAreaElement;
        expect(el.disabled).toBe(false);

        zoneWrapper.run(() => {
            context.isDisabled = true;
        });
        appRoot.renderAll();
        expect(el.disabled).toBe(true);

        zoneWrapper.run(() => {
            context.isDisabled = false;
        });
        appRoot.renderAll();
        expect(el.disabled).toBe(false);
    });
});
