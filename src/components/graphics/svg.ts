import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';

/**
 * SVG 组件配置。
 */
export interface ISvgConfig extends IComponentConfig {
    /** SVG 内容字符串。 */
    content?: DynamicValue<string>;
    /** 外部 SVG 文件地址。 */
    src?: DynamicValue<string>;
    /** 宽度。 */
    width?: DynamicValue<string | number>;
    /** 高度。 */
    height?: DynamicValue<string | number>;
    /** 视图框。 */
    viewBox?: DynamicValue<string>;
}

/**
 * SVG 组件。
 */
export class Svg extends BaseComponent<ISvgConfig> {
    private _svgElement: SVGElement | null = null;
    private _lastFetchedSrc: string | null = null;
    private _lastContent: string | null = null;

    /** 返回组件基础样式类名。 */
    protected getBaseClassName(): string | null {
        return 'psu-svg';
    }

    /** 创建容器元素。 */
    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.style.lineHeight = '0';
        return container;
    }

    /** 异步加载外部 SVG 内容。 */
    private async fetchSvg(src: string) {
        if (this._lastFetchedSrc === src) return;
        this._lastFetchedSrc = src;
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.statusText}`);
            const text = await response.text();
            // 确保在加载完成时，如果 src 没变，则更新内容
            if (this._lastFetchedSrc === src) {
                this.updateSvgContent(text);
            }
        } catch (e) {
            console.error(e);
            this._lastFetchedSrc = null;
        }
    }

    /** 更新 SVG 内容。 */
    private updateSvgContent(content: string) {
        if (this._lastContent === content) {
            return;
        }
        this._lastContent = content;

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');
        const newSvg = doc.querySelector('svg');

        if (newSvg) {
            if (this._svgElement && this._svgElement.parentNode === this.element) {
                this.element.removeChild(this._svgElement);
            }
            this._svgElement = newSvg;
            this.element.appendChild(this._svgElement);
            this.applySvgAttributes();
        }
    }

    /** 应用 SVG 属性。 */
    private applySvgAttributes() {
        if (!this._svgElement) return;

        const width = this.resolveValue(this.config.width);
        if (width !== undefined) {
            this._svgElement.setAttribute('width', typeof width === 'number' ? `${width}px` : String(width));
        }

        const height = this.resolveValue(this.config.height);
        if (height !== undefined) {
            this._svgElement.setAttribute('height', typeof height === 'number' ? `${height}px` : String(height));
        }

        const viewBox = this.resolveValue(this.config.viewBox);
        if (viewBox !== undefined) {
            this._svgElement.setAttribute('viewBox', viewBox);
        }
    }

    /** 渲染。 */
    public render(): void {
        super.render();

        const content = this.resolveValue(this.config.content);
        const src = this.resolveValue(this.config.src);

        if (content) {
            this.updateSvgContent(content);
        } else if (src) {
            this.fetchSvg(src);
        }

        this.applySvgAttributes();
    }
}
