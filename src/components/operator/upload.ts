import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

/**
 * 上传组件配置。
 */
export interface IUploadConfig extends IComponentConfig {
    /** 按钮文本。 */
    text: DynamicValue<string>;
    /** 接受的文件类型，例如 '.jpg,.png' 或 'image/*'。 */
    accept?: DynamicValue<string>;
    /** 是否支持多选。 */
    multiple?: DynamicValue<boolean>;
    /** 文件选择后的回调。 */
    onUpload?: (files: FileList | null, self: Upload) => void;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
}

/**
 * 上传组件。
 * 内部封装了一个隐藏的 input[type="file"] 和一个触发点击的按钮。
 */
export class Upload extends BaseComponent<IUploadConfig> {
    private fileInput!: HTMLInputElement;
    private button!: HTMLButtonElement;

    protected getBaseClassName(): string | null {
        return 'ps-upload';
    }

    protected createHTMLElement(): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'inline-block';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';

        const button = document.createElement('button');
        button.className = 'ps-button'; // 复用按钮样式

        button.addEventListener('click', () => {
            if (!button.disabled) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', () => {
            this.zoneWrapper.run(() => {
                if (this.config.onUpload) {
                    this.config.onUpload(fileInput.files, this);
                }
            });
        });

        container.appendChild(fileInput);
        container.appendChild(button);
        return container;
    }

    public render(): void {
        super.render();
        
        if (!this.button || !this.fileInput) {
            const container = this.element;
            this.fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            this.button = container.querySelector('button') as HTMLButtonElement;
        }

        const text = this.resolveValue(this.config.text);
        this.button.textContent = text;

        if (this.config.accept !== undefined) {
            this.fileInput.accept = this.resolveValue(this.config.accept) || '';
        }

        if (this.config.multiple !== undefined) {
            this.fileInput.multiple = !!this.resolveValue(this.config.multiple);
        }

        if (this.config.disabled !== undefined) {
            const disabled = !!this.resolveValue(this.config.disabled);
            this.button.disabled = disabled;
        }
    }
}
