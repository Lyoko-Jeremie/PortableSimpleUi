import {AppRoot, initPortableSimpleUiZone, registerComponent, BaseComponent, IComponentConfig} from '../src/index';

// 1. 定义一个新组件
interface ICustomLabelConfig extends IComponentConfig {
    title: string;
    color?: string;
}

class CustomLabel extends BaseComponent<ICustomLabelConfig> {
    protected createHTMLElement(): HTMLElement {
        return document.createElement('h3');
    }

    public render(): void {
        this.element.textContent = `Custom: ${this.config.title}`;
        if (this.config.color) {
            this.element.style.color = this.config.color;
        }
    }
}

// 2. 将组件注册到类型表中，以获得 IDE 提示支持
// 注意：这通常在组件定义的同一个文件中完成
declare module '../src/app-root' {
    interface IComponentRegistry {
        CustomLabel: typeof CustomLabel;
    }
}

// 3. 注册组件实现
registerComponent('CustomLabel', CustomLabel);

async function runExample() {
    const myZone = initPortableSimpleUiZone('add-mechanism-example');

    myZone.run(() => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const app = new AppRoot(container, {id: 'app'});

        // 使用内置组件，享受类型提示
        app.add.Label({
            text: 'I am a standard label',
            style: {color: 'blue'}
        });

        const flex = app.add.Flex({
            style: {border: '1px solid black', padding: '10px'}
        });

        // 在 Flex 容器中添加自定义组件，同样享受类型提示
        flex.add.CustomLabel({
            title: 'I am a custom component!',
            color: 'red'
        });

        // 甚至可以嵌套
        const subFlex = flex.add.Flex({style: {marginLeft: '20px'}});
        subFlex.add.Button({
            text: 'Nested Button',
            onClick: () => alert('Clicked!')
        });
    });
}

runExample().catch(console.error);
