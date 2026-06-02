import {signal, initPortableSimpleUiZone, AppRoot} from '../src/index';

describe('Dynamic Styles', () => {
    let myZone: Zone;

    beforeAll(() => {
        myZone = initPortableSimpleUiZone('test-zone');
    });

    it('should update style when signal changes', (done) => {
        myZone.run(() => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const colorSignal = signal('red');
            const appRoot = new AppRoot(container, {
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
