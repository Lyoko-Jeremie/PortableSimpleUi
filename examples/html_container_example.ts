
import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';

window.addEventListener('load', () => {
    const zoneWrapper = createZoneWrapper('example-zone');
    const app = new AppRoot(document.body, {
        zoneWrapper: zoneWrapper,
        styleIsolation: {
            mode: 'none',
            useDefaultTheme: true
        }
    });

    const container = app.add.Container({
        padding: '20px',
        style: {
            border: '1px solid #ccc',
            borderRadius: '8px',
            margin: '20px'
        }
    });

    container.add.Text({ text: '以下是 HTMLContainer 容纳的原生 HTML 元素：', style: { marginBottom: '10px', fontWeight: 'bold' } });

    // 创建一个原生 HTML 元素
    const nativeDiv = document.createElement('div');
    nativeDiv.style.backgroundColor = '#f0f0f0';
    nativeDiv.style.padding = '15px';
    nativeDiv.style.border = '2px dashed blue';
    nativeDiv.innerHTML = `
        <h3>原生 HTML 元素</h3>
        <p>这是通过 <code>document.createElement</code> 创建并传递给 <code>HTMLContainer</code> 的。</p>
        <button id="native-btn">原生按钮</button>
    `;

    // 使用 HTMLContainer 包装它
    const htmlContainer = container.add.HTMLContainer({
        element: nativeDiv
    });

    // 展示如何动态替换元素
    container.add.Button({
        text: '替换为另一个元素',
        onClick: () => {
            const newDiv = document.createElement('div');
            newDiv.style.backgroundColor = '#e0ffe0';
            newDiv.style.padding = '10px';
            newDiv.style.border = '2px solid green';
            newDiv.innerHTML = '<p>我是被替换后的新元素！</p>';
            htmlContainer.setElement(newDiv);
        }
    });

    // 验证原生交互是否工作
    const btn = nativeDiv.querySelector('#native-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            alert('原生按钮被点击了！');
        });
    }

    container.add.Divider({});
    container.add.Text({ text: 'HTMLContainer 也可以用于嵌入 Canvas 或其他第三方库生成的元素。' });
});
