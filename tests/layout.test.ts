import {createZoneWrapper, AppRoot, IZoneWrapper, signal} from '../src/index';

describe('Layout Components', () => {
    let zoneWrapper: IZoneWrapper;

    beforeAll(() => {
        zoneWrapper = createZoneWrapper('layout-test-zone');
    });

    it('Container should apply padding and contain children', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const container = appRoot.add.Container({
                padding: '20px'
            });
            container.add.Text({text: 'Child'});

            expect(container.getElement().style.padding).toBe('20px');
            expect(container.getElement().childNodes.length).toBe(1);
        });
    });

    it('Row should have display flex and flexDirection row', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const row = appRoot.add.Row({gap: '10px'});

            expect(row.getElement().style.display).toBe('flex');
            expect(row.getElement().style.flexDirection).toBe('row');
            expect(row.getElement().style.gap).toBe('10px');
        });
    });

    it('Column should have display flex and flexDirection column', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const col = appRoot.add.Column({gap: '5px'});

            expect(col.getElement().style.display).toBe('flex');
            expect(col.getElement().style.flexDirection).toBe('column');
            expect(col.getElement().style.gap).toBe('5px');
        });
    });

    it('Grid should have display grid and apply templates', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const grid = appRoot.add.Grid({
                templateColumns: '1fr 1fr',
                gap: '15px'
            });

            expect(grid.getElement().style.display).toBe('grid');
            expect(grid.getElement().style.gridTemplateColumns).toBe('1fr 1fr');
            expect(grid.getElement().style.gap).toBe('15px');
        });
    });

    it('Group should have fieldset and legend', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const group = appRoot.add.Group({title: 'My Group'});

            expect(group.getElement().tagName.toLowerCase()).toBe('fieldset');
            const legend = group.getElement().querySelector('legend');
            expect(legend).not.toBeNull();
            expect(legend?.textContent).toBe('My Group');
        });
    });

    it('Group should apply dynamic styleContainer to content element', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});
            const contentStyle = signal({
                display: 'grid',
                gap: '8px',
                backgroundColor: 'red'
            });

            const group = appRoot.add.Group({
                title: 'Styled Group',
                style: {
                    backgroundColor: 'blue'
                },
                styleContainer: contentStyle
            });
            const contentElement = group.getElement().querySelector('div') as HTMLDivElement;

            expect(group.getElement().style.backgroundColor).toBe('blue');
            expect(contentElement.style.display).toBe('grid');
            expect(contentElement.style.gap).toBe('8px');
            expect(contentElement.style.backgroundColor).toBe('red');

            contentStyle.set({
                display: 'flex',
                gap: '12px',
                backgroundColor: 'green'
            });
            appRoot.renderAll();

            expect(contentElement.style.display).toBe('flex');
            expect(contentElement.style.gap).toBe('12px');
            expect(contentElement.style.backgroundColor).toBe('green');
        });
    });

    it('Divider should apply correct styles', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const divider = appRoot.add.Divider({color: 'red', thickness: '5px'});

            expect(divider.getElement().style.backgroundColor).toBe('red');
            expect(divider.getElement().style.height).toBe('5px');
        });
    });

    it('Spacer should apply flex', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const spacer = appRoot.add.Spacer({flex: 2});

            // 在某些浏览器/JSDOM 中，flex: 2 可能会被展开
            expect(spacer.getElement().style.flex).toMatch(/^2/);
        });
    });
    it('Complex nested add should work', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {zoneWrapper});

            const group = appRoot.add.Group({title: 'Root'});
            const col = group.add.Column({gap: '10px'});
            const row = col.add.Row({gap: '10px'});
            const btn = row.add.Button({text: 'Click me'});
            const text = col.add.Text({text: 'Hello'});

            // Verify structure
            // Group -> fieldset -> div (content) -> Column -> Row -> Button
            //                                             -> Text
            const groupContent = group.getElement().querySelector('div');
            expect(groupContent?.firstChild).toBe(col.getElement());
            expect(col.getElement().childNodes[0]).toBe(row.getElement());
            expect(col.getElement().childNodes[1]).toBe(text.getElement());
            expect(row.getElement().childNodes[0]).toBe(btn.getElement());
        });
    });
});
