import {initPortableSimpleUiZone, AppRoot} from '../src/index';

/**
 * 这是一个展示所有布局组件的示例
 */
async function runExample() {
    const myZone = initPortableSimpleUiZone('layout-components-demo');

    myZone.run(() => {
        const appContainer = document.createElement('div');
        appContainer.id = 'layout-app-root';
        document.body.appendChild(appContainer);

        const appRoot = new AppRoot(appContainer, {
            id: 'layout-demo-root',
            style: {
                width: '800px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'sans-serif',
                backgroundColor: '#f9f9f9'
            }
        });

        appRoot.add.Text({
            text: 'PortableSimpleUi 布局组件展示',
            style: {fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '20px', textAlign: 'center'}
        });

        const mainLayout = appRoot.add.Column({gap: '20px'});

        // 1. Container
        const containerSection = mainLayout.add.Group({title: '1. Container (基础容器)'});
        const container = containerSection.add.Container({
            padding: '15px',
            style: {backgroundColor: '#fff', border: '1px dashed #aaa', borderRadius: '4px'}
        });
        container.add.Text({text: '我在 Container 内部，带有 15px 的内边距。'});

        // 2. Row & Column
        const flexSection = mainLayout.add.Group({title: '2. Row & Column (行列布局)'});
        const row = flexSection.add.Row({gap: '10px', alignItems: 'center'});
        row.add.Button({text: '按钮 1'});
        row.add.Button({text: '按钮 2'});
        row.add.Button({text: '按钮 3'});

        flexSection.add.Divider({margin: '15px 0'});

        const column = flexSection.add.Column({gap: '5px'});
        column.add.Text({text: '垂直项 1'});
        column.add.Text({text: '垂直项 2'});
        column.add.Text({text: '垂直项 3'});

        // 3. Grid
        const gridSection = mainLayout.add.Group({title: '3. Grid (网格布局)'});
        const grid = gridSection.add.Grid({
            templateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            style: {textAlign: 'center'}
        });
        for (let i = 1; i <= 6; i++) {
            grid.add.Container({
                style: {backgroundColor: '#e0e0e0', padding: '10px', borderRadius: '4px'},
            }).add.Text({text: `单元格 ${i}`});
        }

        // 4. Stack
        const stackSection = mainLayout.add.Group({title: '4. Stack (层叠布局)'});
        const stack = stackSection.add.Stack({
            style: {height: '100px', backgroundColor: '#eee'}
        });
        stack.add.Container({
            style: {position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,0,0,0.5)', width: '50px', height: '50px'}
        });
        stack.add.Container({
            style: {position: 'absolute', top: '30px', left: '30px', backgroundColor: 'rgba(0,0,255,0.5)', width: '50px', height: '50px'}
        });
        stack.add.Text({text: '我在 Stack 中', style: {position: 'absolute', bottom: '10px', right: '10px'}});

        // 5. Divider & Spacer
        const miscSection = mainLayout.add.Group({title: '5. Divider & Spacer (分割线与间距)'});
        const rowWithSpacer = miscSection.add.Row({alignItems: 'center'});
        rowWithSpacer.add.Text({text: '左侧文字'});
        rowWithSpacer.add.Spacer(); // 自动撑开
        rowWithSpacer.add.Text({text: '右侧文字'});

        miscSection.add.Divider({color: 'blue', thickness: '2px', margin: '10px 0'});

        const rowWithVerticalDivider = miscSection.add.Row({style: {height: '30px'}, alignItems: 'center'});
        rowWithVerticalDivider.add.Text({text: '项 A'});
        rowWithVerticalDivider.add.Divider({vertical: true, margin: '0 15px'});
        rowWithVerticalDivider.add.Text({text: '项 B'});
        rowWithVerticalDivider.add.Divider({vertical: true, margin: '0 15px'});
        rowWithVerticalDivider.add.Text({text: '项 C'});
    });
}

runExample().catch(console.error);
