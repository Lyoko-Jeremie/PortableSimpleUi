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

        // 初始宽高仅在创建时使用一次
        const initialWidth = this.resolveValue(this.config.width);
        const initialHeight = this.resolveValue(this.config.height);
        if (initialWidth !== undefined) {
            this._canvasElement.width = initialWidth;
        }
        if (initialHeight !== undefined) {
            this._canvasElement.height = initialHeight;
        }

        this.applyStyleToElement(this._canvasElement, this.config.canvasStyle);
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        this.initCanvas();

        // 初始同步容器大小
        container.style.width = `${this._canvasElement!.width}px`;
        container.style.height = `${this._canvasElement!.height}px`;

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

        // 如果是原始值，我们这里不再主动修改它，除非它是 DynamicValue
    }

    /**
     * 手动设置 Canvas 大小，并同步调整外层容器大小
     * @param width 宽度 (px)
     * @param height 高度 (px)
     */
    public setSize(width: number, height: number) {
        let changed = false;
        if (this.canvasElement.width !== width) {
            this.canvasElement.width = width;
            changed = true;
        }
        if (this.canvasElement.height !== height) {
            this.canvasElement.height = height;
            changed = true;
        }

        // 同步到容器和配置
        this.syncSizeFromCanvasSize();
    }

    /**
     * 从 _canvasElement 的当前大小同步到容器和配置中
     */
    public syncSizeFromCanvasSize() {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        let changed = false;
        if (this.element.style.width !== `${width}px` || this.element.style.height !== `${height}px`) {
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
            changed = true;
        }

        // 同步到配置中的 DynamicValue (只写不读)
        this.syncDimensionConfig('width', width);
        this.syncDimensionConfig('height', height);

        if (changed) {
            this.zoneWrapper.runInZone(() => {
                if (this.config.onResize) {
                    this.config.onResize(width, height, this);
                }
            });
        }
    }

    public render(): void {
        // render 时，自动读取 _canvasElement 的大小并同步到 container 的大小以及组件的输入变量 DynamicValue 中
        // 不再读取 config.width/height 来主动设置 canvas 大小
        this.syncSizeFromCanvasSize();

        this.applyStyle();
        if (this._canvasElement) {
            this.applyStyleToElement(this._canvasElement, this.config.canvasStyle);
        }
    }

    public destroy() {
        super.destroy();
    }
}
