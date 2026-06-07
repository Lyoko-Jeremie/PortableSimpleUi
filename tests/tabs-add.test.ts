import {AppRoot} from '../src/app-root';
import {Tabs} from '../src/components/complex/index';
import {createZoneWrapper, IZoneWrapper} from '../src/core';
import '../src/index';

describe('Tabs new add mechanism', () => {
    let container: HTMLElement;
    let zoneWrapper: IZoneWrapper;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        zoneWrapper = createZoneWrapper('test');
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    // it('should create tabs automatically when using tabs.add.xxx()', () => {
    //     const app = new AppRoot(container, { id: 'app', zoneWrapper });
    //     const tabs = app.add.Tabs({ id: 'my-tabs' });
    //
    //     expect(tabs).toBeInstanceOf(Tabs);
    //
    //     const label1 = tabs.add.Label({ text: 'Tab 1 Content', tabTitle: 'Tab 1' });
    //     const label2 = tabs.add.Label({ text: 'Tab 2 Content', tabTitle: 'Tab 2' });
    //
    //     const header = tabs.getElement().querySelector('.ps-tabs-header');
    //     expect(header).toBeTruthy();
    //     const tabItems = header?.querySelectorAll('.ps-tabs-item');
    //     expect(tabItems?.length).toBe(2);
    //     expect(tabItems?.[0].textContent).toBe('Tab 1');
    //     expect(tabItems?.[1].textContent).toBe('Tab 2');
    //
    //     const body = tabs.getElement().querySelector('.ps-tabs-body');
    //     expect(body?.children.length).toBe(2);
    // });

    it('addTab should append a tab item and create its content Container', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const tabs = app.add.Tabs({id: 'my-tabs'});

        const tabContent = tabs.addTab();
        const label = tabContent.Label({text: 'Tab 1 Content'});

        const header = tabs.getElement().querySelector('.ps-tabs-header');
        const tabItems = header?.querySelectorAll('.ps-tabs-item');
        expect(tabItems?.length).toBe(1);
        expect(tabItems?.[0]?.textContent).toBe('tab-1');
        expect(tabs.activeTabId).toBe('tab-1');

        const body = tabs.getElement().querySelector('.ps-tabs-body');
        const contentContainer = body?.children[0] as HTMLElement | undefined;
        expect(body?.children.length).toBe(1);
        expect(contentContainer?.id).toBe('tab-1');
        expect(contentContainer?.classList.contains('ps-container')).toBe(true);
        expect(contentContainer?.contains(label.getElement())).toBe(true);
    });

    it('addTab should allow multiple child components in the generated Container', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const tabs = app.add.Tabs({id: 'my-tabs'});

        const tabContent = tabs.addTab({id: 'details', title: 'Details'});
        const title = tabContent.Label({text: 'Details title'});
        const bodyText = tabContent.Text({text: 'Details body'});

        const header = tabs.getElement().querySelector('.ps-tabs-header');
        const tabItems = header?.querySelectorAll('.ps-tabs-item');
        expect(tabItems?.length).toBe(1);
        expect(tabItems?.[0]?.textContent).toBe('Details');

        const body = tabs.getElement().querySelector('.ps-tabs-body');
        const contentContainer = body?.children[0] as HTMLElement | undefined;
        expect(body?.children.length).toBe(1);
        expect(contentContainer?.children.length).toBe(2);
        expect(contentContainer?.children[0]).toBe(title.getElement());
        expect(contentContainer?.children[1]).toBe(bodyText.getElement());
    });

    it('addTab should reject duplicate tab ids', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const tabs = app.add.Tabs({
            id: 'my-tabs',
            items: [{id: 'existing', label: 'Existing'}]
        });

        expect(() => tabs.addTab({id: 'existing', title: 'Duplicate'})).toThrow('Tab existing already exists.');
    });

    it('should respect autoCreateTab: false', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const tabs = app.add.Tabs({id: 'my-tabs', autoCreateTab: false});

        tabs.add.Label({text: 'Not a tab'});

        const header = tabs.getElement().querySelector('.ps-tabs-header');
        const tabItems = header?.querySelectorAll('.ps-tabs-item');
        expect(tabItems?.length).toBe(0);
    });
});
