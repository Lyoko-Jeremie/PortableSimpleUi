import {AppRoot} from '../../src/app-root';
import {signal} from '../../src/core';

const uiRoot = document.getElementById('ui-root');

if (uiRoot) {
    const app = new AppRoot(uiRoot, {
        styleIsolation: {
            mode: 'none', // 使用全局样式方便演示，也可以改为 shadow
            useDefaultTheme: true
        }
    });

    // 1. Layout: Tabs
    const tabs = app.add.Tabs({
        items: [
            {id: 'basic', label: '基础组件'},
            {id: 'layout', label: '布局组件'},
            {id: 'complex', label: '复合组件'},
            {id: 'form', label: '表单演示'},
            {id: 'signal', label: '响应式数据'}
        ],
        activeTabId: 'basic'
    });

    // 为每个 Tab 项创建内容容器
    const basicTab = tabs.add.Container({});
    const layoutTab = tabs.add.Container({});
    const complexTab = tabs.add.Container({});
    const formTab = tabs.add.Container({});
    const signalTab = tabs.add.Container({});

    // --- 基础组件页 ---
    const basicAdd = basicTab.add;

    basicAdd.Group({title: '按钮与文本'});
    const btnGroup = basicAdd.Flex({gap: '10px', direction: 'row', alignItems: 'center'});
    const btnAdd = btnGroup.add;
    btnAdd.Button({text: '常规按钮', onClick: () => alert('点击了按钮')});
    btnAdd.Button({text: '禁用按钮', disabled: true});
    btnAdd.Label({text: '这是一个标签'});
    btnAdd.Text({text: '这是普通文本'});

    basicAdd.Group({title: '表单基础'});
    const formBaseGroup = basicAdd.Flex({gap: '15px', direction: 'column'});
    const fbAdd = formBaseGroup.add;
    fbAdd.Input({placeholder: '请输入内容...', onInput: (v) => console.log('Input:', v)});

    const checkRow = fbAdd.Flex({gap: '20px'});
    const crAdd = checkRow.add;
    crAdd.Checkbox({label: '选项 A', checked: true});
    crAdd.Checkbox({label: '选项 B', checked: false});

    const radioRow = fbAdd.Flex({gap: '20px'});
    const rrAdd = radioRow.add;
    rrAdd.Radio({label: '男', name: 'sex', value: 'male', checked: true});
    rrAdd.Radio({label: '女', name: 'sex', value: 'female', checked: false});

    basicAdd.Group({title: '选择器与滑动条'});
    const selGroup = basicAdd.Flex({gap: '15px', direction: 'column'});
    const sgAdd = selGroup.add;
    sgAdd.Select({
        options: [
            {label: '苹果', value: 'apple'},
            {label: '香蕉', value: 'banana'},
            {label: '橙子', value: 'orange'}
        ]
    });
    sgAdd.Slider({min: 0, max: 100, value: 50});
    sgAdd.ColorPicker({value: '#007bff'});
    sgAdd.ProgressBar({value: 60});

    // --- 布局组件页 ---
    const layoutAdd = layoutTab.add;

    layoutAdd.Group({title: 'Flex 布局 (Row)'});
    const row = layoutAdd.Row({gap: '10px'});
    const rowAdd = row.add;
    for (let i = 1; i <= 3; i++) rowAdd.Button({text: `按钮 ${i}`});

    layoutAdd.Group({title: 'Flex 布局 (Column)'});
    const col = layoutAdd.Column({gap: '5px'});
    const colAdd = col.add;
    for (let i = 1; i <= 3; i++) colAdd.Text({text: `文本行 ${i}`});

    layoutAdd.Group({title: 'Grid 布局'});
    const grid = layoutAdd.Grid({templateColumns: 'repeat(3, 1fr)', gap: '10px'});
    const gridAdd = grid.add;
    for (let i = 1; i <= 6; i++) {
        gridAdd.Container({
            style: {background: '#eee', padding: '10px', textAlign: 'center', borderRadius: '4px'},
            id: `cell-${i}`
        });
        // 注意：原示例中直接操作了 cell.element.innerText = `单元格 ${i}`;
        // 现在我们需要尽量避免。如果需要文本，应该使用 Text 组件。
        // 但为了最小改动，我们这里改用 Text 组件。
    }

    layoutAdd.Divider({margin: '20px 0'});
    layoutAdd.Text({text: '分隔线之后'});

    // --- 复合组件页 ---
    const complexAdd = complexTab.add;

    complexAdd.Alert({text: '这是一条提示信息', type: 'info'});

    const cardRow = complexAdd.Flex({gap: '15px'});
    const cardRowAdd = cardRow.add;

    const card = cardRowAdd.Card({title: '卡片标题'});
    const cardBodyAdd = card.add;
    cardBodyAdd.Text({text: '这是卡片的内容区域。'});
    cardBodyAdd.Button({text: '卡片操作'});

    const avatarGroup = complexAdd.Flex({gap: '10px', alignItems: 'center', style: {margin: '15px 0'}});
    const agAdd = avatarGroup.add;
    agAdd.Avatar({src: 'https://via.placeholder.com/40', size: 40});
    agAdd.Badge({text: '99+', color: 'red'});

    complexAdd.Group({title: '列表与分页'});
    complexAdd.List({
        dataSource: ['列表项目 1', '列表项目 2', '列表项目 3'],
        renderItem: (item) => {
            const el = document.createElement('div');
            el.innerText = item;
            return el;
        }
    });
    complexAdd.Pagination({current: 1, total: 50, pageSize: 10});

    complexAdd.Group({title: '树形视图'});
    complexAdd.TreeView({
        data: [
            {
                key: '1',
                title: '根节点',
                children: [
                    {key: '1-1', title: '子节点 1'},
                    {key: '1-2', title: '子节点 2'}
                ]
            }
        ]
    });

    // --- 表单演示页 ---
    const formAdd = formTab.add;

    formAdd.Form({
        items: [
            {label: '用户名', key: 'username', component: 'Input', componentConfig: {placeholder: '请输入'}},
            {label: '出生日期', key: 'birthday', component: 'DatePicker', componentConfig: {}},
            {label: '上传头像', key: 'avatar', component: 'FilePicker', componentConfig: {}}
        ],
        onFinish: (values) => {
            console.log('Form Values:', values);
            alert('提交成功，请看控制台');
        }
    });

    // 弹窗演示
    formAdd.Button({
        text: '打开弹窗',
        style: {margin: '20px 0'},
        onClick: () => {
            const modal = app.add.Modal({title: '演示弹窗'});
            const modalAdd = modal.add;
            modalAdd.Text({text: '这是一个通过 Modal 组件创建的弹窗。'});
            modalAdd.Button({text: '关闭', onClick: () => modal.hide()});
            modal.show();
        }
    });

    // 吐司演示
    formAdd.Button({
        text: '显示 Toast', onClick: () => {
            app.add.Toast({text: '这是一条通知消息', duration: 3000});
        }
    });

    // --- 响应式数据页 ---
    const signalAdd = signalTab.add;

    const count = signal(0);
    signalAdd.Text({text: '计数值：'});
    signalAdd.Text({text: count as any}); // 组件通常支持 ISignal 作为文本

    signalAdd.Flex({style: {margin: '10px 0'}, gap: '10px'}).add.Button({
        text: '点击增加',
        onClick: () => count.set(count.get() + 1)
    });

    app.renderAll();
}
