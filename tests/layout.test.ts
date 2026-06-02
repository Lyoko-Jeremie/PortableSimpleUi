import {initPortableSimpleUiZone, AppRoot} from '../src/index';

describe('Layout Components', () => {
    let myZone: Zone;

    beforeAll(() => {
        myZone = initPortableSimpleUiZone('layout-test-zone');
    });

    it('Container should apply padding and contain children', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const container = appRoot.add.Container({
                padding: '20px'
            });
            container.add.Text({ text: 'Child' });

            expect(container.element.style.padding).toBe('20px');
            expect(container.element.childNodes.length).toBe(1);
        });
    });

    it('Row should have display flex and flexDirection row', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const row = appRoot.add.Row({ gap: '10px' });

            expect(row.element.style.display).toBe('flex');
            expect(row.element.style.flexDirection).toBe('row');
            expect(row.element.style.gap).toBe('10px');
        });
    });

    it('Column should have display flex and flexDirection column', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const col = appRoot.add.Column({ gap: '5px' });

            expect(col.element.style.display).toBe('flex');
            expect(col.element.style.flexDirection).toBe('column');
            expect(col.element.style.gap).toBe('5px');
        });
    });

    it('Grid should have display grid and apply templates', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const grid = appRoot.add.Grid({
                templateColumns: '1fr 1fr',
                gap: '15px'
            });

            expect(grid.element.style.display).toBe('grid');
            expect(grid.element.style.gridTemplateColumns).toBe('1fr 1fr');
            expect(grid.element.style.gap).toBe('15px');
        });
    });

    it('Group should have fieldset and legend', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const group = appRoot.add.Group({ title: 'My Group' });

            expect(group.element.tagName.toLowerCase()).toBe('fieldset');
            const legend = group.element.querySelector('legend');
            expect(legend).not.toBeNull();
            expect(legend?.textContent).toBe('My Group');
        });
    });

    it('Divider should apply correct styles', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const divider = appRoot.add.Divider({ color: 'red', thickness: '5px' });

            expect(divider.element.style.backgroundColor).toBe('red');
            expect(divider.element.style.height).toBe('5px');
        });
    });

    it('Spacer should apply flex', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});
            
            const spacer = appRoot.add.Spacer({ flex: 2 });
            
            // 在某些浏览器/JSDOM 中，flex: 2 可能会被展开
            expect(spacer.element.style.flex).toMatch(/^2/);
        });
    });
});
