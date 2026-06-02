import {createZoneWrapper, AppRoot, IZoneWrapper} from '../src/index';
import {ContainerComponent} from '../src/component';

describe('Container Node Placement', () => {
    let zoneWrapper: IZoneWrapper;

    beforeAll(() => {
        zoneWrapper = createZoneWrapper('container-node-test-zone');
    });

    function testContainerPlacement(name: string, createContainer: (appRoot: AppRoot) => any, expectedHostSelector?: string) {
        it(`${name} should place children inside its designated host node`, () => {
            zoneWrapper.run(() => {
                const containerEl = document.createElement('div');
                const appRoot = new AppRoot(containerEl, { zoneWrapper });

                const container = createContainer(appRoot);
                const text = container.add.Text({ text: 'Child Content' });

                // 如果有选择器，通过选择器查找 host，否则使用 element
                const host = expectedHostSelector
                    ? container.getElement().querySelector(expectedHostSelector)
                    : container.element;

                expect(host).not.toBeNull();
                expect(host!.contains(text.element)).toBe(true);

                // 确保它不在 element 之后（如果是同一个节点，contains 为 true 且 offsetParent 等通常能体现层级，
                // 但这里我们简单检查 parentNode 链）
                let parent = text.getElement().parentElement;
                let foundHost = false;
                while (parent) {
                    if (parent === host) {
                        foundHost = true;
                        break;
                    }
                    parent = parent.parentElement;
                }
                expect(foundHost).toBe(true);
            });
        });
    }

    // 基础容器
    testContainerPlacement('Container', (app) => app.add.Container({}));
    testContainerPlacement('Flex', (app) => app.add.Flex({}));
    testContainerPlacement('Row', (app) => app.add.Row({}));
    testContainerPlacement('Column', (app) => app.add.Column({}));
    testContainerPlacement('Grid', (app) => app.add.Grid({}));

    // 重写了 getChildrenHost 的容器，通过其内部特有的类名来定位 host
    testContainerPlacement('Group', (app) => app.add.Group({ title: 'Test Group' }), 'div');
    testContainerPlacement('Card', (app) => app.add.Card({ title: 'Test Card' }), '.ps-card-body');
    testContainerPlacement('Modal', (app) => app.add.Modal({ title: 'Test Modal' }), '.ps-modal-body');
    testContainerPlacement('Tabs', (app) => app.add.Tabs({
        items: [{ id: 't1', label: 'Tab 1' }],
        activeTabId: 't1'
    }), '.ps-tabs-body');

    it('Container should keep children after re-render', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            const card = appRoot.add.Card({ title: 'Dynamic Card' });
            const text = card.add.Text({ text: 'Static Content' });

            const body = card.getElement().querySelector('.ps-card-body');
            expect(body!.contains(text.getElement())).toBe(true);

            // 触发重新渲染
            card.markDirty();

            // 验证子组件仍然在 body 中，没有因为 innerHTML = '' 之类的操作丢失
            expect(body!.contains(text.getElement())).toBe(true);
        });
    });

    it('Tabs should keep children after tab switch', () => {
        zoneWrapper.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, { zoneWrapper });

            const tabs = appRoot.add.Tabs({
                items: [
                    { id: 't1', label: 'Tab 1' },
                    { id: 't2', label: 'Tab 2' }
                ],
                activeTabId: 't1'
            });

            const tab1Content = tabs.add.Container({ id: 'c1' });
            const tab2Content = tabs.add.Container({ id: 'c2' });

            const body = tabs.getElement().querySelector('.ps-tabs-body');
            expect(body!.contains(tab1Content.getElement())).toBe(true);
            expect(body!.contains(tab2Content.getElement())).toBe(true);

            // 切换 Tab
            tabs.activeTabId = 't2';
            appRoot.renderAll();

            // 验证子组件仍然在 body 中
            expect(body!.contains(tab1Content.getElement())).toBe(true);
            expect(body!.contains(tab2Content.getElement())).toBe(true);
        });
    });
});
