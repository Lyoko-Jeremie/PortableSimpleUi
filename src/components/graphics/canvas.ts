import {BaseComponent, IComponentConfig} from '../../component';
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

    /**
     * 设置 Canvas 大小，并同步调整外层容器大小
     * @param width 宽度 (px)
     * @param height 高度 (px)
     */
    public setSize(width: number, height: number) {
        this.canvasElement.width = width;
        this.canvasElement.height = height;

        // 自动调整外包装 html 节点的相关样式来适配
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;

        if (this.config.onResize) {
            this.config.onResize(width, height, this);
        }
    }

    public syncSizeFromCanvasSize() {
        this.setSize(this.canvasElement.width, this.canvasElement.height);
    }

    public render(): void {
        const width = this.resolveValue(this.config.width);
        const height = this.resolveValue(this.config.height);

        if (width !== undefined && height !== undefined) {
            if (this.canvasElement.width !== width || this.canvasElement.height !== height) {
                this.setSize(width, height);
            }
        } else if (width !== undefined) {
            if (this.canvasElement.width !== width) {
                this.canvasElement.width = width;
                this.element.style.width = `${width}px`;
            }
        } else if (height !== undefined) {
            if (this.canvasElement.height !== height) {
                this.canvasElement.height = height;
                this.element.style.height = `${height}px`;
            }
        }

        this.applyStyle();
    }
}
