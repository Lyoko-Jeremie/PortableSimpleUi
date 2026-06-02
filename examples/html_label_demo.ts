import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';

// 初始化容器
const container = document.createElement('div');
document.body.appendChild(container);

// 创建 Zone 包装器
const zoneWrapper = createZoneWrapper('example-zone');

// 创建应用根组件
const appRoot = new AppRoot(container, {
    zoneWrapper,
    styleIsolation: {
        mode: 'shadow',
        useDefaultTheme: true
    }
});

// 添加一个 Container 布局
const containerEl = appRoot.add.Container({
    padding: '20px'
});

// 在 Container 中添加 Flex
const flex = containerEl.add.Flex({
    direction: 'column',
    gap: '20px'
});

// 演示 1: 普通文本 Label
flex.add.Label({
    text: '普通文本 Label'
});

// 演示 2: HTML 字符串 Label
flex.add.Label({
    html: '<span style="color: red; font-weight: bold;">带有内联样式的 HTML Label</span>'
});

// 演示 3: 带有复杂结构的 HTML Label
flex.add.Label({
    html: `
        <div style="border: 1px solid #ccc; padding: 10px; border-radius: 4px;">
            <h4>HTML 结构演示</h4>
            <p>这是一段由 <i>HTML 字符串</i> 直接生成的 Label 内容。</p>
            <ul>
                <li>列表项 A</li>
                <li>列表项 B</li>
            </ul>
        </div>
    `
});

// 演示 4: HTML 字符串 Text
flex.add.Text({
    html: '<button onclick="alert(\'Hello!\')">点击我 (HTML Text 注入按钮)</button>'
});

// 演示 5: 优先级演示
flex.add.Label({
    text: '这行文字不应该显示',
    html: '<strong>因为 html 属性优先级更高，所以你看到了加粗文字</strong>'
});

// 渲染所有组件
appRoot.renderAll();
