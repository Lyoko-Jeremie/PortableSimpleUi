import {AppRoot, createZoneWrapper} from '../src';

describe('Component tree references', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container.parentElement) {
            document.body.removeChild(container);
        }
    });

    it('should link direct children to AppRoot', () => {
        const zoneWrapper = createZoneWrapper('component-tree');
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const label = app.add.Label({text: 'Root child'});

        expect(app.parentComponent).toBeNull();
        expect(app.getAppRoot()).toBe(app);
        expect(label.parentComponent).toBe(app);
        expect(label.getParentComponents()).toEqual([app]);
        expect(label.getRootComponent()).toBe(app);
        expect(label.getAppRoot()).toBe(app);
    });

    it('should expose the full parent chain for nested components', () => {
        const zoneWrapper = createZoneWrapper('component-tree-nested');
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const outer = app.add.Flex({id: 'outer'});
        const inner = outer.add.Container({id: 'inner'});
        const button = inner.add.Button({text: 'Nested button'});

        expect(outer.parentComponent).toBe(app);
        expect(inner.parentComponent).toBe(outer);
        expect(button.parentComponent).toBe(inner);
        expect(button.getParentComponents()).toEqual([inner, outer, app]);
        expect(button.getRootComponent()).toBe(app);
        expect(button.getAppRoot()).toBe(app);
    });

    it('should work when AppRoot uses shadow DOM isolation', () => {
        const zoneWrapper = createZoneWrapper('component-tree-shadow');
        const app = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: {mode: 'shadow'}
        });
        const card = app.add.Card({title: 'Shadow card'});
        const text = card.add.Text({text: 'Shadow child'});

        expect(card.parentComponent).toBe(app);
        expect(text.parentComponent).toBe(card);
        expect(text.getParentComponents()).toEqual([card, app]);
        expect(text.getAppRoot()).toBe(app);
    });

    it('should clear parent references when components are destroyed', () => {
        const zoneWrapper = createZoneWrapper('component-tree-destroy');
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const flex = app.add.Flex({id: 'parent'});
        const label = flex.add.Label({text: 'Child'});

        app.destroy();

        expect(label.parentComponent).toBeNull();
        expect(flex.parentComponent).toBeNull();
        expect(label.getAppRoot()).toBeNull();
        expect(flex.getAppRoot()).toBeNull();
    });
});
