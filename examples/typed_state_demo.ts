import {
    AppRoot,
    BaseComponent,
    createZoneWrapper,
    IComponentConfig,
    IZoneWrapper,
    registerComponent
} from '../src/index';

interface ICounterConfig extends IComponentConfig {
    initialCount?: number;
}

interface ICounterState {
    count: number;
    label?: string;
}

class Counter extends BaseComponent<ICounterConfig, ICounterState> {
    constructor(config: ICounterConfig, zoneWrapper: IZoneWrapper) {
        super(config, zoneWrapper);
        this.state.count = config.initialCount ?? 0;
        this.state.label = 'Typed counter';
    }

    protected createHTMLElement(): HTMLElement {
        const button = document.createElement('button');
        button.addEventListener('click', () => {
            this.zoneWrapper.run(() => {
                this.state.count += 1;
                this.markDirty();
            });
        });
        return button;
    }

    public render(): void {
        super.render();
        this.element.textContent = `${this.state.label}: ${this.state.count}`;
    }
}

declare module '../src/app-root' {
    interface IComponentRegistry {
        Counter: typeof Counter;
    }
}

registerComponent('Counter', Counter);

export function runTypedStateDemo(parentElement: HTMLElement = document.body): AppRoot {
    const zoneWrapper = createZoneWrapper('typed-state-demo');
    const host = document.createElement('div');
    parentElement.appendChild(host);

    const app = new AppRoot(host, {
        zoneWrapper
    });

    app.add.Counter({
        initialCount: 1
    });

    app.add.Button({
        text: 'Change text',
        onClick: (self) => {
            self.state.text = 'Typed state works';
        }
    });

    return app;
}
