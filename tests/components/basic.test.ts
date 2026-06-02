import {AppRoot} from '../../src/app-root';
import {createZoneWrapper} from '../../src/core';

describe('Basic Components', () => {
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

    describe('Label', () => {
        it('should render text content correctly', () => {
            const label = appRoot.add.Label({ text: 'Hello World' });
            appRoot.renderAll();
            expect(label.element.textContent).toBe('Hello World');
            expect(label.element.innerHTML).toBe('Hello World');
        });

        it('should render html content correctly', () => {
            const label = appRoot.add.Label({ html: '<b>Bold Text</b>' });
            appRoot.renderAll();
            expect(label.element.innerHTML).toBe('<b>Bold Text</b>');
            const boldElement = label.element.querySelector('b');
            expect(boldElement).not.toBeNull();
            expect(boldElement?.textContent).toBe('Bold Text');
        });

        it('should prioritize html over text', () => {
            const label = appRoot.add.Label({ 
                text: 'Plain Text',
                html: '<i>Italic Text</i>' 
            });
            appRoot.renderAll();
            expect(label.element.innerHTML).toBe('<i>Italic Text</i>');
            expect(label.element.textContent).toBe('Italic Text');
        });

        it('should handle for attribute', () => {
            const label = appRoot.add.Label({ text: 'Label', for: 'input-id' });
            appRoot.renderAll();
            expect(label.element.getAttribute('for')).toBe('input-id');
        });
    });

    describe('Text', () => {
        it('should render text content correctly', () => {
            const text = appRoot.add.Text({ text: 'Hello' });
            appRoot.renderAll();
            expect(text.element.textContent).toBe('Hello');
        });

        it('should render html content correctly', () => {
            const text = appRoot.add.Text({ html: '<span>Nested</span>' });
            appRoot.renderAll();
            expect(text.element.innerHTML).toBe('<span>Nested</span>');
        });
    });
});
