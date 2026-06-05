import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';

/**
 * 该示例展示了如何使用 AppRoot 的暂停和恢复渲染功能，
 * 以便在进行大量 UI 构建操作时提高响应速度。
 */
export function pauseResumeDemo(container: HTMLElement) {
    const zoneWrapper = createZoneWrapper('demo-zone');

    // 初始化 AppRoot
    const appRoot = new AppRoot(container, {
        zoneWrapper,
        styleIsolation: { mode: 'none' }
    });

    const infoLabel = appRoot.add.Label({
        text: '准备开始批量构建...',
        style: { marginBottom: '10px', display: 'block' }
    });

    const startButton = appRoot.add.Button({
        text: '开始批量构建 (暂停渲染)',
        onClick: () => {
            console.log('开始批量构建...');

            // 1. 暂停渲染
            appRoot.pauseRendering();

            infoLabel.getElement().textContent = '正在构建 100 个按钮...';

            // 2. 进行大量 UI 操作
            for (let i = 0; i < 100; i++) {
                appRoot.add.Button({
                    text: `按钮 ${i}`,
                    style: { margin: '2px' }
                });
            }

            console.log('构建完毕，准备恢复渲染');

            // 3. 恢复并强制刷新一次
            appRoot.resumeRendering(true);

            infoLabel.getElement().textContent = '批量构建完成！';
            (startButton.getElement() as HTMLButtonElement).disabled = true;
            startButton.getElement().textContent = '构建已完成';
        }
    });

    return appRoot;
}

// 如果是在浏览器环境中直接运行
if (typeof document !== 'undefined') {
    const root = document.getElementById('root') || document.body;
    pauseResumeDemo(root);
}
