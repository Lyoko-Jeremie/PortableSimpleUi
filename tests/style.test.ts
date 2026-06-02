import {signal, createZoneWrapper, AppRoot, IZoneWrapper} from '../src/index';

describe('Dynamic Styles', () => {
    let zoneWrapper: IZoneWrapper;

    beforeAll(() => {
        zoneWrapper = createZoneWrapper('test-zone');
    });

    it('should update style when signal changes', (done) => {
        zoneWrapper.run(() => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const colorSignal = signal('red');
            const appRoot = new AppRoot(container, {
                zoneWrapper,
                id: 'test-root'
            });

            const text = appRoot.add.Text({
                text: 'Hello',
                style: {
                    color: colorSignal
                }
            });

            expect(text.element.style.color).toBe('red');

            colorSignal.set('blue');
            appRoot.renderAll();

            expect(text.element.style.color).toBe('blue');
            document.body.removeChild(container);
            done();
        });
    });
});
