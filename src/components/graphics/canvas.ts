import {BaseComponent, IComponentConfig, StyleDeclaration} from '../../component';
import {IZoneWrapper} from '../../core';
import {DynamicValue} from '../../types';

/**
 * Canvas 组件配置接口
 */
export interface ICanvasConfig extends IComponentConfig {
    /** 初始宽度 */
    width?: DynamicValue<number>;
    /** 初始高度 */
    height?: DynamicValue<number>;
    /** Canvas 元素的样式 */
    canvasStyle?: StyleDeclaration;
    /** 当 Canvas 大小改变时的回调 */
    onResize?: (width: number, height: number, self: Canvas) => void;
}

/**
 * Canvas 组件
 *
 * 这是一个 HTMLCanvasElement 的包装容器，
 * 提供了与第三方库协商大小的能力。
 */
export class Canvas extends BaseComponent<ICanvasConfig> {
    private _canvasElement: HTMLCanvasElement | null = null;
    private _resizeObserver: ResizeObserver | null = null;
    private _isInternalResizing = false;

    private get canvasElement(): HTMLCanvasElement {
        if (!this._canvasElement) {
            this.initCanvas();
        }
        return this._canvasElement!;
    }

    protected getBaseClassName(): string | null {
        return 'psu-canvas-container';
    }

    private initCanvas() {
        if (this._canvasElement) return;
        this._canvasElement = document.createElement('canvas');
        this._canvasElement.style.display = 'block';
        this._canvasElement.classList.add('psu-canvas');
        this.applyStyleToElement(this._canvasElement, this.config.canvasStyle);

        // 监听外部修改 Canvas 大小的情况
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(() => {
                if (this._isInternalResizing) return;
                // 只有当 Canvas 元素的属性（width/height）与当前记录的不同时才同步
                // ResizeObserver 在 Canvas 属性变化时也会触发
                this.syncSizeFromCanvasSize();
            });
            this._resizeObserver.observe(this._canvasElement);
        }
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        this.initCanvas();
        container.appendChild(this._canvasElement!);
        return container;
    }

    /**
     * 获取原生的 HTMLCanvasElement 供第三方库使用
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvasElement;
    }

    private syncDimensionConfig(key: 'width' | 'height', value: number): void {
        const current = this.config[key];

        if (typeof current === 'function') {
            return;
        }

        if (current && typeof current === 'object') {
            if ('set' in current && typeof current.set === 'function') {
                current.set(value);
            } else if ('value' in current) {
                current.value = value;
            }
            return;
        }

        this.config[key] = value;
    }

    /**
     * 设置 Canvas 大小，并同步调整外层容器大小
     * @param width 宽度 (px)
     * @param height 高度 (px)
     */
    public setSize(width: number, height: number) {
        const wasInternal = this._isInternalResizing;
        this._isInternalResizing = true;
        try {
            this.syncDimensionConfig('width', width);
            this.syncDimensionConfig('height', height);

            let changed = false;
            // 检查容器样式是否与目标大小一致，作为是否发生变化的依据
            if (this.element.style.width !== `${width}px` || this.element.style.height !== `${height}px`) {
                changed = true;
            }

            if (this.canvasElement.width !== width) {
                this.canvasElement.width = width;
            }
            if (this.canvasElement.height !== height) {
                this.canvasElement.height = height;
            }

            // 自动调整外包装 html 节点的相关样式来适配
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;

            if (changed) {
                this.zoneWrapper.runInZone(() => {
                    if (this.config.onResize) {
                        this.config.onResize(width, height, this);
                    }
                });
            }
        } finally {
            // 使用 setTimeout 确保在 ResizeObserver 触发后（如果有的话）再恢复标识
            // 或者由于 ResizeObserver 是异步触发的，其实可以直接恢复，
            // 但为了保险，我们在这里结束。
            this._isInternalResizing = wasInternal;
        }
    }

    public syncSizeFromCanvasSize() {
        this.setSize(this.canvasElement.width, this.canvasElement.height);
    }

    public render(): void {
        const width = this.resolveValue(this.config.width);
        const height = this.resolveValue(this.config.height);

        // 获取当前 Canvas 的实际属性值，避免不必要的重设
        const currentWidth = this.canvasElement.width;
        const currentHeight = this.canvasElement.height;

        if (width !== undefined && height !== undefined) {
            // 只有当目标大小与当前大小不一致时，才调用 setSize
            // setSize 会触发 width/height 的赋值，从而导致 Canvas 内容清空
            if (width !== currentWidth || height !== currentHeight) {
                this.setSize(width, height);
            }
        } else if (width !== undefined) {
            if (currentWidth !== width) {
                this.canvasElement.width = width;
                this.element.style.width = `${width}px`;
            }
        } else if (height !== undefined) {
            if (currentHeight !== height) {
                this.canvasElement.height = height;
                this.element.style.height = `${height}px`;
            }
        }

        this.applyStyle();
        if (this._canvasElement) {
            this.applyStyleToElement(this._canvasElement, this.config.canvasStyle);
        }
    }

    public destroy() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        super.destroy();
    }
}
