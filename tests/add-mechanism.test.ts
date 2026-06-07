import {AppRoot} from '../src/app-root';
import {Label, Button} from '../src/components/basic/index';
import {Flex} from '../src/components/layout/index';
import {createZoneWrapper, IZoneWrapper} from '../src/core';
import '../src/index'; // 确保组件已注册

describe('Component Add Mechanism', () => {
    let container: HTMLElement;
    let zoneWrapper: IZoneWrapper;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        zoneWrapper = createZoneWrapper('test');
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should add Label correctly via appRoot.add.Label', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const label = app.add.Label({
            id: 'my-label',
            text: 'Hello'
        });

        expect(label).toBeInstanceOf(Label);
        expect(label.getElement().id).toBe('my-label');
        expect(label.getElement().textContent).toBe('Hello');
        expect(app.host.contains(label.getElement())).toBe(true);
    });

    it('should add Button correctly via appRoot.add.Button', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        let clicked = false;
        const button = app.add.Button({
            id: 'my-button',
            text: 'Click me',
            onClick: () => {
                clicked = true;
            }
        });

        expect(button).toBeInstanceOf(Button);
        expect(button.getElement().textContent).toBe('Click me');

        button.getElement().click();
        expect(clicked).toBe(true);
    });

    it('should add Flex and nested components correctly', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        const flex = app.add.Flex({id: 'my-flex'});

        expect(flex).toBeInstanceOf(Flex);
        expect(flex.getElement().style.display).toBe('flex');

        const nestedLabel = flex.add.Label({text: 'Nested'});
        expect(nestedLabel).toBeInstanceOf(Label);
        expect(flex.getElement().contains(nestedLabel.getElement())).toBe(true);
    });

    it('should throw error if component is not registered', () => {
        const app = new AppRoot(container, {id: 'app', zoneWrapper});
        expect(() => {
            (app.add as any).NonExistentComponent({});
        }).toThrow('Component NonExistentComponent is not registered.');
    });
});
