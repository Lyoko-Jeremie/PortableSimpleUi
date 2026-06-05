import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';

/**
 * 图片组件配置。
 */
export interface IImageConfig extends IComponentConfig {
    /** 图片地址。 */
    src: DynamicValue<string>;
    /** 替代文本。 */
    alt?: DynamicValue<string>;
    /** 宽度（可传数字或字符串）。 */
    width?: DynamicValue<string | number>;
    /** 高度（可传数字或字符串）。 */
    height?: DynamicValue<string | number>;
}

/**
 * 图片组件。
 */
export class Image extends BaseComponent<IImageConfig> {
    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'ps-image';
    }

    /** 创建 img 元素。 */
    protected createHTMLElement(): HTMLImageElement {
        return document.createElement('img');
    }

    /** 渲染图片属性。 */
    public render(): void {
        super.render();
        const img = this.element as HTMLImageElement;
        const src = this.resolveValue(this.config.src);
        if (img.src !== src) {
            img.src = src;
        }
        if (this.config.alt !== undefined) {
            const alt = this.resolveValue(this.config.alt);
            if (img.alt !== alt) {
                img.alt = alt;
            }
        }

        const width = this.resolveValue(this.config.width);
        if (width !== undefined) {
            img.style.width = typeof width === 'number' ? `${width}px` : String(width);
        }

        const height = this.resolveValue(this.config.height);
        if (height !== undefined) {
            img.style.height = typeof height === 'number' ? `${height}px` : String(height);
        }
    }
}
