import {AppRoot, createZoneWrapper} from '../src/index';

const zoneWrapper = createZoneWrapper('tabs-demo');
const app = new AppRoot(document.body, {
    zoneWrapper,
    styleIsolation: {
        mode: 'none',
        useDefaultTheme: true
    }
});

const tabs = app.add.Tabs({
    id: 'wrap-tabs',
    activeTabId: 'tab1'
});

// 添加大量标签以测试换行
for (let i = 1; i <= 20; i++) {
    const tabId = `tab${i}`;
    tabs.addTab({ id: tabId, title: `Tab ${i} Long Label` }).Label({
        text: `Content for Tab ${i}`
    });
}

console.log('Tabs wrap demo loaded');
