import {createZoneWrapper, AppRoot, IZoneWrapper} from '../src/index';

describe('HTMLContainer', () => {
    let zoneWrapper: IZoneWrapper;

    beforeAll(() => {
        zoneWrapper = createZoneWrapper('html-container-test-zone');
    });

    it('should display the provided native HTML element', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            const nativeDiv = document.createElement('div');
            nativeDiv.id = 'test-native-div';
            nativeDiv.textContent = 'Native Content';

            const htmlContainer = appRoot.add.HTMLContainer({
                element: nativeDiv
            });

            // 包装器应该是 div，且包含 nativeDiv
            expect(htmlContainer.getElement()).not.toBe(nativeDiv);
            expect(htmlContainer.getElementToContain()).toBe(nativeDiv);
            expect(htmlContainer.getElement().contains(nativeDiv)).toBe(true);
            expect(nativeDiv.textContent).toBe('Native Content');
        });
    });

    it('should allow optional element and late assignment', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            // 不传 element
            const htmlContainer = appRoot.add.HTMLContainer({});
            expect(htmlContainer.getElementToContain()).toBeUndefined();
            expect(htmlContainer.getElement().innerHTML).toBe('');

            // 后续设置
            const lateDiv = document.createElement('span');
            lateDiv.textContent = 'Late Content';
            htmlContainer.setElement(lateDiv);

            expect(htmlContainer.getElementToContain()).toBe(lateDiv);
            expect(htmlContainer.getElement().contains(lateDiv)).toBe(true);
        });
    });

    it('should allow replacing the element', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            const div1 = document.createElement('div');
            div1.textContent = 'First';
            const htmlContainer = appRoot.add.HTMLContainer({ element: div1 });

            expect(htmlContainer.getElement().contains(div1)).toBe(true);

            const div2 = document.createElement('div');
            div2.textContent = 'Second';
            htmlContainer.setElement(div2);

            expect(htmlContainer.getElement().contains(div1)).toBe(false);
            expect(htmlContainer.getElement().contains(div2)).toBe(true);
            expect(htmlContainer.getElementToContain()).toBe(div2);
        });
    });

    it('should maintain the native element after app re-render', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            const nativeDiv = document.createElement('div');
            nativeDiv.id = 're-render-test';

            const htmlContainer = appRoot.add.HTMLContainer({
                element: nativeDiv
            });

            expect(htmlContainer.getElement().contains(nativeDiv)).toBe(true);

            // Trigger re-render
            appRoot.markDirty();
            appRoot.renderAll();

            // 验证它仍然在包装器中
            expect(htmlContainer.getElement().contains(nativeDiv)).toBe(true);
        });
    });
});
