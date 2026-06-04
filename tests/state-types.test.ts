import {BaseComponent, Button, createZoneWrapper, IComponentConfig} from '../src';

interface ICounterState {
    count: number;
    label?: string;
}

class CounterComponent extends BaseComponent<IComponentConfig, ICounterState> {
    protected createHTMLElement(): HTMLElement {
        return document.createElement('div');
    }

    public setCount(count: number): void {
        this.state.count = count;
    }
}

function expectType<T>(value: T): T {
    return value;
}

function assertButtonStateTypes(button: Button): void {
    expectType<string | undefined>(button.state.text);
    button.state.text = 'Clicked';

    // @ts-expect-error text state only accepts string values.
    button.state.text = 1;

    // @ts-expect-error undeclared state fields should not be available.
    button.state.missing = 'nope';
}

function assertCustomStateTypes(counter: CounterComponent): void {
    expectType<number>(counter.state.count);
    expectType<string | undefined>(counter.state.label);

    counter.state.count = 1;
    counter.state.label = 'ready';

    // @ts-expect-error count must remain a number.
    counter.state.count = '1';
}

describe('typed component state', () => {
    it('keeps runtime state behavior while exposing compile-time state types', () => {
        const zoneWrapper = createZoneWrapper('state-types-test');
        const button = new Button({text: 'Initial'}, zoneWrapper);
        button.state.text = 'Updated';

        const counter = new CounterComponent({}, zoneWrapper);
        counter.setCount(2);

        expect(button.state.text).toBe('Updated');
        expect(counter.state.count).toBe(2);

        void assertButtonStateTypes;
        void assertCustomStateTypes;
    });
});
