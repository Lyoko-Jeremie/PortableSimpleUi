import {initPortableSimpleUiZone, AppRoot} from '../src/index';

// 模拟外部样式
const style = document.createElement('style');
style.textContent = `
    body { background: #f0f0f0; padding: 20px; }
    button { background: red; } /* 全局按钮样式，不应影响库内组件 */
`;
document.head.appendChild(style);

async function runExample() {
    const myZone = initPortableSimpleUiZone('theme-demo');

    myZone.run(() => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        // 1. Shadow DOM 模式，自动加载默认主题
        const app1 = new AppRoot(container, {
            styleIsolation: { mode: 'shadow' },
            style: { marginBottom: '20px' }
        });

        app1.add.Label({ text: 'Shadow DOM + Default Theme' });
        const flex1 = app1.add.Flex({ gap: '10px', style: { marginTop: '10px' } });
        flex1.add.Button({ text: 'Primary Button' });
        flex1.add.Input({ placeholder: 'Type something...' });
        flex1.add.Checkbox({ label: 'Check me' });

        // 2. None 模式，手动加载 CSS (在 HTML 中引入 theme.css)
        // 这里模拟手动添加类名
        const app2 = new AppRoot(container, {
            styleIsolation: { mode: 'none' },
            style: { border: '1px dashed #666', padding: '10px' }
        });

        // 为了演示，我们需要确保页面上有 .ps-root 的样式
        // 通常用户会在 HTML 中 <link> 引入 theme.css
        // 这里我们动态注入
        import('../src/theme/index').then(({DEFAULT_THEME_CSS}) => {
             const styleEl = document.createElement('style');
             // 将 .ps-shadow-root 替换为 .ps-root 以便在全局使用
             styleEl.textContent = DEFAULT_THEME_CSS.replace(/\.ps-shadow-root/g, '.ps-root');
             document.head.appendChild(styleEl);
        });

        app2.add.Label({ text: 'None Mode (External CSS via .ps-root)' });
        const flex2 = app2.add.Flex({ gap: '10px', style: { marginTop: '10px' } });
        flex2.add.Button({ text: 'Styled Button' });
        flex2.add.ProgressBar({ value: 0.7 });
    });
}

runExample().catch(console.error);
