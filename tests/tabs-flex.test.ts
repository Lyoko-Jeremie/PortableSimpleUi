import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';
import { Tabs } from '../src/components/complex/index';
import { Flex } from '../src/components/layout/index';

describe('Tabs and Flex Integration', () => {
    let app: AppRoot;
    const zoneWrapper = createZoneWrapper('test-zone');

    beforeEach(() => {
        const container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);
        app = new AppRoot(container, { zoneWrapper });
    });

    it('should maintain Flex display as flex when inside Tabs', () => {
        const tabs = app.add.Tabs({ id: 'tabs' });

        // 添加一个 Flex 组件作为 Tab
        const flexTab = tabs.addTab({
            title: 'Flex Tab',
        }).Flex({
            id: 'flex-tab',
        });

        // 验证初始 display
        expect(flexTab.getElement().style.display).toBe('flex');

        // 渲染 Tabs
        tabs.render();

        // 获取 Flex 组件的 DOM 元素
        const flexEl = flexTab.getElement();

        // 验证 display 仍然是 'flex'
        expect(flexEl.style.display).toBe('flex');
    });

    it('should maintain Container display as default (empty) when inside Tabs', () => {
        const tabs = app.add.Tabs({ id: 'tabs' });

        const containerTab = tabs.addTab({
            title: 'Container Tab',
        }).Container({
            id: 'container-tab',
        });

        tabs.render();

        const containerEl = containerTab.getElement();

        // 普通 Container 默认没有内联 display
        expect(containerEl.style.display).toBe('');
    });

    // it('should correctly hide non-active tabs', () => {
    //     const tabs = app.add.Tabs({ id: 'tabs' });
    //     const flexTab = tabs.addTab({
    //         title: 'Flex Tab',
    //     }).Flex({
    //         id: 'flex-tab',
    //     });
    //     const containerTab = tabs.addTab({
    //         title: 'Container Tab',
    //     }).Container({
    //         id: 'container-tab',
    //     });
    //
    //     tabs.activeTabId = 'flex-tab';
    //     tabs.render();
    //     expect(flexTab.getElement().style.display).toBe('flex');
    //     expect(containerTab.getElement().style.display).toBe('none');
    //
    //     tabs.activeTabId = 'container-tab';
    //     tabs.render();
    //     expect(flexTab.getElement().style.display).toBe('none');
    //     expect(containerTab.getElement().style.display).toBe('');
    // });
});
