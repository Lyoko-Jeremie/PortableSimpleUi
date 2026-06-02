import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';

describe('AppRoot Destruction', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentElement) {
            document.body.removeChild(container);
        }
    });

    it('should destroy AppRoot and remove it from DOM', () => {
        const zoneWrapper = createZoneWrapper('test');
        const appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });

        expect(container.contains(appRoot.host)).toBe(true);

        appRoot.destroy();

        expect(container.contains(appRoot.host)).toBe(false);
        expect(appRoot.host.parentElement).toBeNull();
    });

    it('should unregister from zoneWrapper when destroyed', () => {
        const zoneWrapper = createZoneWrapper('test');
        const appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });

        expect(zoneWrapper.rootsToRender.has(appRoot)).toBe(true);

        appRoot.destroy();

        expect(zoneWrapper.rootsToRender.has(appRoot)).toBe(false);
    });

    it('should destroy child components when AppRoot is destroyed', () => {
        const zoneWrapper = createZoneWrapper('test');
        const appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });

        // 添加一个按钮组件
        const button = appRoot.add.Button({ text: 'Test' });
        const buttonEl = button.getElement();

        expect(appRoot.host.contains(buttonEl)).toBe(true);

        appRoot.destroy();

        // 按钮应该从 DOM 中移除
        expect(appRoot.host.contains(buttonEl)).toBe(false);
        expect(buttonEl.parentElement).toBeNull();
    });

    it('should work with shadow DOM mode', () => {
        const zoneWrapper = createZoneWrapper('test');
        const appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'shadow' }
        });

        expect(container.contains(appRoot.host)).toBe(true);
        expect(appRoot.host.shadowRoot).not.toBeNull();

        const button = appRoot.add.Button({ text: 'Shadow Test' });
        const buttonEl = button.getElement();
        
        // 在 shadow mode 下，组件被添加到 shadowRoot 里的一个 div 中
        // 根据 app-root.ts，它被添加到 .ps-shadow-root 元素中
        const shadowRootEl = appRoot.host.shadowRoot!.querySelector('.ps-shadow-root');
        expect(shadowRootEl!.contains(buttonEl)).toBe(true);

        appRoot.destroy();

        expect(container.contains(appRoot.host)).toBe(false);
        expect(shadowRootEl!.contains(buttonEl)).toBe(false);
    });
});
