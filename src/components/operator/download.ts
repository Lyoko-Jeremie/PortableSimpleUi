import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

/**
 * 下载组件配置。
 */
export interface IDownloadConfig extends IComponentConfig {
    /** 按钮文本。 */
    text: DynamicValue<string>;
    /** 下载文件名。 */
    fileName: DynamicValue<string>;
    /** 下载内容，可以是字符串、Blob、或者是返回这些内容的函数。 */
    content: DynamicValue<string | Blob>;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
    /** 下载前的回调。 */
    onBeforeDownload?: (self: Download) => void;
}

/**
 * 下载组件。
 * 点击时触发文件下载。
 */
export class Download extends BaseComponent<IDownloadConfig> {
    private button!: HTMLButtonElement;

    protected getBaseClassName(): string | null {
        return 'ps-download';
    }

    protected createHTMLElement(): HTMLElement {
        const button = document.createElement('button');
        button.className = 'ps-button';
        this.button = button;
        button.addEventListener('click', () => {
            if (button.disabled) return;

            this.zoneWrapper.run(() => {
                if (this.config.onBeforeDownload) {
                    this.config.onBeforeDownload(this);
                }
                this.triggerDownload();
            });
        });
        return button;
    }

    private triggerDownload() {
        const content = this.resolveValue(this.config.content);
        const fileName = this.resolveValue(this.config.fileName);

        if (content === undefined || content === null) return;

        const blob = content instanceof Blob ? content : new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    public render(): void {
        super.render();
        if (!this.button) {
            this.button = this.element as HTMLButtonElement;
        }
        this.button.textContent = this.resolveValue(this.config.text);
        if (this.config.disabled !== undefined) {
            this.button.disabled = !!this.resolveValue(this.config.disabled);
        }
    }
}
