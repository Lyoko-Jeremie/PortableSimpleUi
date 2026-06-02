import {initPortableSimpleUiZone, AppRoot} from '../src/index';
import {TreeView} from '../src/components/complex/index';

describe('TreeView Collapse', () => {
    let myZone: Zone;

    beforeAll(() => {
        myZone = initPortableSimpleUiZone('treeview-test-zone');
    });

    it('should collapse and expand nodes when clicking switcher', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const data = [
                {
                    title: 'Parent',
                    key: 'parent',
                    children: [
                        { title: 'Child 1', key: 'child1' }
                    ]
                }
            ];

            const treeView = appRoot.add.TreeView({ data });
            
            // 初始状态不展开
            expect(treeView.getElement().textContent).toContain('Parent');
            expect(treeView.getElement().textContent).not.toContain('Child 1');

            // 查找 switcher 并点击
            let switcher = treeView.getElement().querySelector('span') as HTMLElement;
            expect(switcher.textContent).toBe('▶');
            switcher.click();

            // 展开后应该能看到子节点
            expect(treeView.getElement().textContent).toContain('Child 1');
            
            // 重新获取 switcher，因为 render 重新创建了 DOM
            switcher = treeView.getElement().querySelector('span') as HTMLElement;
            expect(switcher.textContent).toBe('▼');

            // 再次点击收起
            switcher.click();
            expect(treeView.getElement().textContent).not.toContain('Child 1');
            
            switcher = treeView.getElement().querySelector('span') as HTMLElement;
            expect(switcher.textContent).toBe('▶');
        });
    });

    it('should support initial expandedKeys', () => {
        myZone.run(() => {
            const containerEl = document.createElement('div');
            const appRoot = new AppRoot(containerEl, {});

            const data = [
                {
                    title: 'Parent',
                    key: 'parent',
                    children: [
                        { title: 'Child 1', key: 'child1' }
                    ]
                }
            ];

            const treeView = appRoot.add.TreeView({ 
                data,
                expandedKeys: ['parent']
            });
            
            expect(treeView.getElement().textContent).toContain('Child 1');
            const switcher = treeView.getElement().querySelector('span') as HTMLElement;
            expect(switcher.textContent).toBe('▼');
        });
    });
});
