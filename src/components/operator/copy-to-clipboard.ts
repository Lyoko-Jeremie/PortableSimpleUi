import {BaseComponent, IComponentConfig} from '../../component';
import {DynamicValue} from '../../types';
import {IZoneWrapper} from '../../core';

/**
 * 复制到剪贴板组件配置。
 */
export interface ICopyToClipboardConfig extends IComponentConfig {
    /** 按钮文本。 */
    text: DynamicValue<string>;
    /** 要复制的内容。 */
    content: DynamicValue<string>;
    /** 复制成功后的回调。 */
    onCopy?: (content: string, success: boolean, self: CopyToClipboard) => void;
    /** 是否禁用。 */
    disabled?: DynamicValue<boolean>;
}

/**
 * 复制到剪贴板组件。
 */
export class CopyToClipboard extends BaseComponent<ICopyToClipboardConfig> {
    private button!: HTMLButtonElement;

    protected getBaseClassName(): string | null {
        return 'ps-copy-to-clipboard';
    }

    protected createHTMLElement(): HTMLElement {
        const button = document.createElement('button');
        button.className = 'ps-button';
        this.button = button;
        button.addEventListener('click', () => {
            if (button.disabled) return;

            const content = this.resolveValue(this.config.content);
            this.copyText(content);
        });
        return button;
    }

    private async copyText(text: string) {
        let success = false;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                success = true;
            } else {
                // 回退方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                success = document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            success = false;
        }

        this.zoneWrapper.run(() => {
            if (this.config.onCopy) {
                this.config.onCopy(text, success, this);
            }
        });
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
