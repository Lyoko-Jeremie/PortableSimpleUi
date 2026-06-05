import 'zone.js';
import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';

describe('AppRoot Rendering Pause/Resume', () => {
    let container: HTMLElement;
    let zoneWrapper: any;
    let appRoot: AppRoot;
    let renderCount = 0;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        zoneWrapper = createZoneWrapper('test-zone');
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });

        // 劫持 render 方法来计数
        const originalRender = appRoot.render.bind(appRoot);
        renderCount = 0;
        appRoot.render = () => {
            renderCount++;
            originalRender();
        };
    });

    afterEach(() => {
        appRoot.destroy();
        document.body.removeChild(container);
    });

    it('should render normally when not paused', () => {
        zoneWrapper.run(() => {
            // 触发一次渲染
        });
        expect(renderCount).toBe(1);
    });

    it('should NOT render when paused', () => {
        appRoot.pauseRendering();
        zoneWrapper.run(() => {
            // 触发一次渲染，但应该被拦截
        });
        expect(renderCount).toBe(0);
    });

    it('should render after resume if render was requested during pause', () => {
        appRoot.pauseRendering();
        zoneWrapper.run(() => {
            // 触发渲染请求
        });
        expect(renderCount).toBe(0);

        appRoot.resumeRendering();
        expect(renderCount).toBe(1);
    });

    it('should NOT render after resume if NO render was requested during pause', () => {
        appRoot.pauseRendering();
        // 没有 zone 运行
        expect(renderCount).toBe(0);

        appRoot.resumeRendering();
        expect(renderCount).toBe(0);
    });

    it('should force render after resume if force is true', () => {
        appRoot.pauseRendering();
        // 没有 zone 运行
        expect(renderCount).toBe(0);

        appRoot.resumeRendering(true);
        expect(renderCount).toBe(1);
    });

    it('should handle multiple render requests during pause with a single render after resume', () => {
        appRoot.pauseRendering();
        zoneWrapper.run(() => {});
        zoneWrapper.run(() => {});
        zoneWrapper.run(() => {});
        expect(renderCount).toBe(0);

        appRoot.resumeRendering();
        expect(renderCount).toBe(1);
    });
});
