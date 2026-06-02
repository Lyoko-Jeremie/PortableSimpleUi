import {AppRoot} from '../src/app-root';

const uiRoot = document.getElementById('ui-root');

if (uiRoot) {
    const app = new AppRoot(uiRoot, {
        styleIsolation: {
            mode: 'none',
            useDefaultTheme: true
        }
    });

    // 创建 Tabs
    const tabs = app.add.Tabs({
        items: [
            {id: 'tab1', label: 'Tab 1'},
            {id: 'tab2', label: 'Tab 2'}
        ],
        activeTabId: 'tab1'
    });

    // 往 Tabs 里添加内容
    const tab1Container = tabs.add.Container({ id: 'container-1' });
    tab1Container.add.Text({ text: 'Content of Tab 1' });

    const tab2Container = tabs.add.Container({ id: 'container-2' });
    tab2Container.add.Text({ text: 'Content of Tab 2' });

    app.renderAll();

    console.log('Initial Tabs body children count:', document.querySelector('.psu-tabs-body')?.children.length);

    // 切换 Tab，触发 Tabs.render()
    setTimeout(() => {
        console.log('Switching to Tab 2...');
        tabs.activeTabId = 'tab2';
        console.log('After switch - Tabs body children count:', document.querySelector('.psu-tabs-body')?.children.length);
        
        // 检查 Container 1 是否还在 DOM 中
        const c1 = document.getElementById('container-1');
        console.log('Container 1 in DOM:', !!c1);
        if (c1) {
             console.log('Container 1 parent:', c1.parentElement?.className);
        }
    }, 1000);
}
