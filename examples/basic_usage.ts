import {signal, initPortableSimpleUiZone, AppRoot, makeRef, Button} from '../src/index';

// 模拟外部上下文
const aOuterContextInMod = {
    counter: {
        a: {
            b: [
                {
                    c: 1,
                }
            ]
        }
    }
};

async function runExample() {
    // 1. 初始化 Zone
    const myZone = initPortableSimpleUiZone('my-mod-a');

    // 2. 在 Zone 中运行应用逻辑
    myZone.run(() => {
        const appContainer = document.createElement('div');
        appContainer.id = 'app-root';
        document.body.appendChild(appContainer);

        const appRoot = new AppRoot(appContainer, {
            id: 'my-mod-app-root',
            styleIsolation: {
                mode: 'shadow',
                styles: `
                    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #0056b3; }
                    span { font-family: sans-serif; }
                `,
            },
            style: {
                width: '400px',
                border: '1px solid #ccc',
                padding: '20px',
            },
        });

        appRoot.add.Label({
            text: 'PortableSimpleUi Demo',
            style: {fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '10px'}
        });

        // Signal 示例
        const s1 = signal('Initial Signal Value');
        appRoot.add.Label({
            text: s1,
            style: {color: 'blue', display: 'block', marginBottom: '10px'}
        });

        appRoot.add.Button({
            text: 'Update Signal',
            onClick: () => s1.set('Signal Updated at ' + new Date().toLocaleTimeString())
        });

        // Flex 容器示例
        const flex = appRoot.add.Flex({
            style: {
                marginTop: '20px',
                flexDirection: 'column',
                gap: '10px',
                borderTop: '1px solid #eee',
                paddingTop: '10px'
            }
        });

        // makeRef 示例
        const ref_c = makeRef(aOuterContextInMod, 'counter.a.b.0.c', (val) => `Deep Value: ${val}`);

        flex.add.Label({
            text: ref_c,
            style: {color: 'green'}
        });

        flex.add.Button({
            text: 'Increment Deep Value',
            onClick: () => {
                const item = aOuterContextInMod.counter.a.b[0];
                if (item) {
                    item.c += 1;
                }
                // 注意：在 Zone.js 环境下，异步任务结束后会自动触发渲染。
                // 如果是同步修改且希望立即看到效果，或者不在 Zone 管理的宏/微任务中，才需要 markDirty。
            }
        });

        // 组件 State 示例
        flex.add.Button({
            text: 'Self State Button',
            onClick: (self: Button) => {
                self.state.text = 'I was clicked!';
            }
        });
    });
}

// 启动
runExample().catch(console.error);
