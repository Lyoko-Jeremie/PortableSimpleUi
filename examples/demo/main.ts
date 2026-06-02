import {AppRoot} from '../../src/app-root';
import {computed, signal, createZoneWrapper, effect} from '../../src/core';
import {makeRef} from "../../src";

const uiRoot = document.getElementById('ui-root');

if (uiRoot) {
    const myZone = createZoneWrapper('demo-zone');
    myZone.run(() => {
        const app = new AppRoot(uiRoot, {
            zoneWrapper: myZone,
            styleIsolation: {
                mode: 'shadow', // 使用全局样式方便演示，也可以改为 shadow
                useDefaultTheme: true
            }
        });

        // 1. Layout: Tabs
        const tabs = app.add.Tabs({
            items: [
                {id: 'basic', label: '基础组件'},
                {id: 'layout', label: '布局组件'},
                {id: 'complex', label: '复合组件'},
                {id: 'advanced', label: '高级组件'},
                {id: 'form', label: '表单演示'},
                {id: 'signal', label: '响应式数据'}
            ],
            activeTabId: 'basic'
        });

        // 为每个 Tab 项创建内容容器
        const basicTab = tabs.add.Container({});
        const layoutTab = tabs.add.Container({});
        const complexTab = tabs.add.Container({});
        const advancedTab = tabs.add.Container({});
        const formTab = tabs.add.Container({});
        const signalTab = tabs.add.Container({});

        // --- 基础组件页 ---

        const group1 = basicTab.add.Group({title: '按钮与文本'});
        const btnGroup = group1.add.Flex({gap: '10px', direction: 'row', alignItems: 'center'});
        btnGroup.add.Button({text: '常规按钮', onClick: () => alert('点击了按钮')});
        btnGroup.add.Button({text: '禁用按钮', disabled: true});
        btnGroup.add.Label({text: '这是一个标签'});
        btnGroup.add.Text({text: '这是普通文本'});

        const group2 = basicTab.add.Group({title: '表单基础'});
        const formBaseGroup = group2.add.Flex({gap: '15px', direction: 'column'});
        const dataInput = {
            v: 'alice',
        }
        formBaseGroup.add.Input({
            placeholder: '请输入内容...',
            value: makeRef(dataInput, 'v'),
            onInput: (v: string) => {
                console.log('Input:', v);
                dataInput.v = v;
            },
        });
        formBaseGroup.add.Label({text: () => dataInput.v})

        const checkRow = formBaseGroup.add.Flex({gap: '20px'});
        checkRow.add.Checkbox({label: '选项 A', checked: true});
        checkRow.add.Checkbox({label: '选项 B', checked: false});

        const radioRow = formBaseGroup.add.Flex({gap: '20px'});
        radioRow.add.Radio({label: '男', name: 'sex', value: 'male', checked: true});
        radioRow.add.Radio({label: '女', name: 'sex', value: 'female', checked: false});

        const group3 = basicTab.add.Group({title: '选择器与滑动条'});
        const selGroup = group3.add.Flex({gap: '15px', direction: 'column'});
        selGroup.add.Select({
            options: [
                {label: '苹果', value: 'apple'},
                {label: '香蕉', value: 'banana'},
                {label: '橙子', value: 'orange'}
            ]
        });
        selGroup.add.Slider({min: 0, max: 100, value: 50});
        selGroup.add.ColorPicker({value: '#007bff'});
        selGroup.add.ProgressBar({value: 60});

        // --- 布局组件页 ---

        const layoutGroup1 = layoutTab.add.Group({title: 'Flex 布局 (Row)'});
        const row = layoutGroup1.add.Row({gap: '10px'});
        for (let i = 1; i <= 3; i++) row.add.Button({text: `按钮 ${i}`});

        const layoutGroup2 = layoutTab.add.Group({title: 'Flex 布局 (Column)'});
        const col = layoutGroup2.add.Column({gap: '5px'});
        for (let i = 1; i <= 3; i++) col.add.Text({text: `文本行 ${i}`});

        const layoutGroup3 = layoutTab.add.Group({title: 'Grid 布局'});
        const grid = layoutGroup3.add.Grid({templateColumns: 'repeat(3, 1fr)', gap: '10px'});
        for (let i = 1; i <= 6; i++) {
            grid.add.Container({
                style: {background: '#eee', padding: '10px', textAlign: 'center', borderRadius: '4px'},
                id: `cell-${i}`
            });
            // 注意：原示例中直接操作了 cell.element.innerText = `单元格 ${i}`;
            // 现在我们需要尽量避免。如果需要文本，应该使用 Text 组件。
            // 但为了最小改动，我们这里改用 Text 组件。
        }

        layoutTab.add.Divider({margin: '20px 0'});
        layoutTab.add.Text({text: '分隔线之后'});

        // --- 复合组件页 ---

        complexTab.add.Alert({text: '这是一条提示信息', type: 'info'});

        const cardRow = complexTab.add.Flex({gap: '15px'});

        const card = cardRow.add.Card({title: '卡片标题'});
        card.add.Text({text: '这是卡片的内容区域。'});
        card.add.Button({text: '卡片操作'});

        const avatarGroup = complexTab.add.Flex({gap: '10px', alignItems: 'center', style: {margin: '15px 0'}});
        avatarGroup.add.Avatar({src: '#', size: 40});
        avatarGroup.add.Badge({text: '99+', color: 'red'});

        const complexGroup1 = complexTab.add.Group({title: '列表与分页'});
        complexGroup1.add.List({
            dataSource: ['列表项目 1', '列表项目 2', '列表项目 3'],
            renderItem: (item: any) => {
                const el = document.createElement('div');
                el.innerText = item;
                return el;
            }
        });
        complexTab.add.Pagination({current: 1, total: 50, pageSize: 10});

        const complexGroup2 = complexTab.add.Group({title: '树形视图 (可折叠)'});
        complexGroup2.add.TreeView({
            data: [
                {
                    key: '1',
                    title: '根节点',
                    children: [
                        {
                            key: '1-1',
                            title: '子节点 1',
                            children: [
                                {key: '1-1-1', title: '孙子节点 1'}
                            ]
                        },
                        {key: '1-2', title: '子节点 2'}
                    ]
                },
                {
                    key: '2',
                    title: '根节点 2',
                    children: [
                        {key: '2-1', title: '子节点 2-1'}
                    ]
                }
            ],
            expandedKeys: ['1'],
            onSelect: (key: string) => console.log('Selected:', key),
            onExpand: (keys: string[]) => console.log('Expanded Keys:', keys)
        });

        // --- 表单演示页 ---

        formTab.add.Form({
            items: [
                {label: '用户名', key: 'username', component: 'Input', componentConfig: {placeholder: '请输入'}},
                {label: '出生日期', key: 'birthday', component: 'DatePicker', componentConfig: {}},
                {label: '上传头像', key: 'avatar', component: 'FilePicker', componentConfig: {}}
            ],
            onFinish: (values: any) => {
                console.log('Form Values:', values);
                alert('提交成功，请看控制台');
            }
        });

        // 弹窗演示
        formTab.add.Button({
            text: '打开弹窗',
            style: {margin: '20px 0'},
            onClick: () => {
                const modal = app.add.Modal({title: '演示弹窗'});
                // const modalAdd = modal.add;
                modal.add.Text({text: '这是一个通过 Modal 组件创建的弹窗。'});
                modal.add.Button({text: '关闭', onClick: () => modal.hide()});
                modal.show();
            }
        });

        // 吐司演示
        formTab.add.Button({
            text: '显示 Toast', onClick: () => {
                app.add.Toast({text: '这是一条通知消息', duration: 3000});
            }
        });

        // --- 响应式数据页 ---

        const count = signal(0);
        signalTab.add.Text({text: '计数值：'});
        signalTab.add.Text({text: computed(() => `${count.value}`)}); // 组件通常支持 ISignal 作为文本

        signalTab.add.Flex({style: {margin: '10px 0'}, gap: '10px'}).add.Button({
            text: '点击增加',
            onClick: () => count.set(count.get() + 1)
        });

        effect(() => {
            console.log('effect count', count.get());
        })

        app.renderAll();
    });
}
