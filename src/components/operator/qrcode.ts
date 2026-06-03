import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';

/**
 * 二维码组件配置。
 */
export interface IQRCodeConfig extends IComponentConfig {
    /** 二维码内容。 */
    value: DynamicValue<string>;
    /** 二维码大小（像素），默认 128。 */
    size?: DynamicValue<number>;
    /** 容错级别，默认 'M'。 */
    level?: DynamicValue<'L' | 'M' | 'Q' | 'H'>;
}

/**
 * 二维码组件。
 * 使用 Google Chart API 生成二维码图片作为简单实现。
 */
export class QRCode extends BaseComponent<IQRCodeConfig> {
    private img!: HTMLImageElement;

    protected getBaseClassName(): string | null {
        return 'ps-qrcode';
    }

    protected createHTMLElement(): HTMLElement {
        const img = document.createElement('img');
        img.style.display = 'block';
        this.img = img;
        return img;
    }

    public render(): void {
        super.render();
        if (!this.img) {
            this.img = this.element as HTMLImageElement;
        }
        const value = this.resolveValue(this.config.value);
        const size = this.resolveValue(this.config.size) || 128;
        const level = this.resolveValue(this.config.level) || 'M';

        if (value) {
            // 使用 Google Chart API 作为简单的二维码生成方案
            const encodedValue = encodeURIComponent(value);
            this.img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedValue}&choe=UTF-8&chld=${level}`;
            this.img.width = size;
            this.img.height = size;
        } else {
            this.img.src = '';
        }
    }
}
