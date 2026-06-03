import {AppRoot} from '../src/app-root';
import {createZoneWrapper, signal} from '../src/core';

describe('Image Component', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('image-test');

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

    it('should render an img element with correct src', () => {
        const img = appRoot.add.Image({
            src: 'test.png',
            alt: 'Test Image'
        });
        appRoot.renderAll();

        const element = img.getElement() as HTMLImageElement;
        expect(element.tagName).toBe('IMG');
        expect(element.src).toContain('test.png');
        expect(element.alt).toBe('Test Image');
    });

    it('should update src when signal changes', () => {
        const srcSignal = signal('initial.png');
        const img = appRoot.add.Image({
            src: srcSignal
        });
        appRoot.renderAll();

        const element = img.getElement() as HTMLImageElement;
        expect(element.src).toContain('initial.png');

        srcSignal.set('updated.png');
        appRoot.renderAll();
        expect(element.src).toContain('updated.png');
    });

    it('should apply width and height styles', () => {
        const img = appRoot.add.Image({
            src: 'test.png',
            width: '100px',
            height: 200
        });
        appRoot.renderAll();

        const element = img.getElement() as HTMLImageElement;
        expect(element.style.width).toBe('100px');
        expect(element.style.height).toBe('200px');
    });
});
