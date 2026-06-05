import { AppRoot } from '../src/app-root';
import { createZoneWrapper } from '../src/core';

describe('Canvas', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('canvas-test');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: { mode: 'none' }
        });
    });

    afterEach(() => {
        appRoot.destroy();
        document.body.removeChild(container);
    });

    it('should create a canvas element inside a container', () => {
        const canvasComp = appRoot.add.Canvas({
            width: 200,
            height: 150
        });
        appRoot.renderAll();

        const el = canvasComp.getElement();
        expect(el.classList.contains('psu-canvas-container')).toBe(true);

        const canvasEl = canvasComp.getCanvas();
        expect(canvasEl.tagName).toBe('CANVAS');
        expect(canvasEl.width).toBe(200);
        expect(canvasEl.height).toBe(150);

        expect(el.style.width).toBe('200px');
        expect(el.style.height).toBe('150px');
    });

    it('should update size via setSize', () => {
        const canvasComp = appRoot.add.Canvas({
            width: 100,
            height: 100
        });
        appRoot.renderAll();

        canvasComp.setSize(300, 200);

        const canvasEl = canvasComp.getCanvas();
        expect(canvasEl.width).toBe(300);
        expect(canvasEl.height).toBe(200);

        const el = canvasComp.getElement();
        expect(el.style.width).toBe('300px');
        expect(el.style.height).toBe('200px');
    });

    it('should trigger onResize when size is set', () => {
        const onResize = jest.fn();
        const canvasComp = appRoot.add.Canvas({
            width: 100,
            height: 100,
            onResize
        });
        appRoot.renderAll();

        canvasComp.setSize(400, 300);

        expect(onResize).toHaveBeenCalledWith(400, 300, canvasComp);
    });

    it('should reflect dynamic width and height changes', () => {
        const state = { w: 100, h: 100 };
        const canvasComp = appRoot.add.Canvas({
            width: () => state.w,
            height: () => state.h
        });
        appRoot.renderAll();

        expect(canvasComp.getCanvas().width).toBe(100);

        state.w = 500;
        appRoot.renderAll();

        expect(canvasComp.getCanvas().width).toBe(500);
        expect(canvasComp.getElement().style.width).toBe('500px');
    });

    it('should keep function-controlled size driven by external state', () => {
        const state = { w: 100, h: 100 };
        const canvasComp = appRoot.add.Canvas({
            width: () => state.w,
            height: () => state.h
        });
        appRoot.renderAll();

        canvasComp.setSize(300, 200);

        expect(canvasComp.getCanvas().width).toBe(100);
        expect(canvasComp.getCanvas().height).toBe(100);

        state.w = 300;
        state.h = 200;
        appRoot.renderAll();

        expect(canvasComp.getCanvas().width).toBe(300);
        expect(canvasComp.getCanvas().height).toBe(200);
    });

    it('should sync container size when canvas element is resized externally', (done) => {
        // Mock ResizeObserver
        const originalResizeObserver = global.ResizeObserver;
        let callback: any;
        global.ResizeObserver = class {
            constructor(cb: any) {
                callback = cb;
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        } as any;

        const onResize = jest.fn();
        const canvasComp = appRoot.add.Canvas({
            width: 100,
            height: 100,
            onResize
        });
        appRoot.renderAll();
        // 渲染时会调用一次 setSize，所以 onResize 会被调用一次
        expect(onResize).toHaveBeenCalledTimes(1);

        const canvasEl = canvasComp.getCanvas();
        // 模拟外部修改
        canvasEl.width = 300;
        canvasEl.height = 200;

        // 模拟 ResizeObserver 触发
        if (callback) {
            callback();
        }

        // 检查是否同步到了容器
        const el = canvasComp.getElement();
        expect(el.style.width).toBe('300px');
        expect(el.style.height).toBe('200px');
        expect(onResize).toHaveBeenCalledTimes(2);
        expect(onResize).toHaveBeenLastCalledWith(300, 200, canvasComp);

        global.ResizeObserver = originalResizeObserver;
        done();
    });
});
