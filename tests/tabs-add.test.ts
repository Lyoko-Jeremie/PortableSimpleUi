import { AppRoot } from '../src/app-root';
import { Tabs } from '../src/components/complex/index';
import { createZoneWrapper, IZoneWrapper } from '../src/core';
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

    it('should create tabs automatically when using tabs.add.xxx()', () => {
        const app = new AppRoot(container, { id: 'app', zoneWrapper });
        const tabs = app.add.Tabs({ id: 'my-tabs' });

        expect(tabs).toBeInstanceOf(Tabs);

        const label1 = tabs.add.Label({ text: 'Tab 1 Content', tabTitle: 'Tab 1' });
        const label2 = tabs.add.Label({ text: 'Tab 2 Content', tabTitle: 'Tab 2' });

        const header = tabs.getElement().querySelector('.ps-tabs-header');
        expect(header).toBeTruthy();
        const tabItems = header?.querySelectorAll('.ps-tabs-item');
        expect(tabItems?.length).toBe(2);
        expect(tabItems?.[0].textContent).toBe('Tab 1');
        expect(tabItems?.[1].textContent).toBe('Tab 2');

        const body = tabs.getElement().querySelector('.ps-tabs-body');
        expect(body?.children.length).toBe(2);
    });

    it('should respect autoCreateTab: false', () => {
        const app = new AppRoot(container, { id: 'app', zoneWrapper });
        const tabs = app.add.Tabs({ id: 'my-tabs', autoCreateTab: false });

        tabs.add.Label({ text: 'Not a tab' });

        const header = tabs.getElement().querySelector('.ps-tabs-header');
        const tabItems = header?.querySelectorAll('.ps-tabs-item');
        expect(tabItems?.length).toBe(0);
    });
});
