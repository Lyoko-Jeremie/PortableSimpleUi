import {AppRoot, createComponentContainerProxy} from '../../src/app-root';
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
        activeId: 'basic'
    });

    // --- 基础组件页 ---
    const basicTab = tabs.getChildrenHost().children[0] as HTMLElement;
    // Tabs 的 childrenHost 是渲染子组件的地方。
    // 为了将组件放入特定 Tab，我们需要在对应 Tab 容器上创建 proxy。
    const basicAdd = createComponentContainerProxy(basicTab);

    basicAdd.Group({title: '按钮与文本'});
    const btnGroup = basicAdd.Flex({gap: '10px', direction: 'row', align: 'center'});
    const btnAdd = createComponentContainerProxy(btnGroup.element);
    btnAdd.Button({text: '常规按钮', onClick: () => alert('点击了按钮')});
    btnAdd.Button({text: '禁用按钮', disabled: true});
    btnAdd.Label({text: '这是一个标签'});
    btnAdd.Text({text: '这是普通文本'});

    basicAdd.Group({title: '表单基础'});
    const formBaseGroup = basicAdd.Flex({gap: '15px', direction: 'column'});
    const fbAdd = createComponentContainerProxy(formBaseGroup.element);
    fbAdd.Input({placeholder: '请输入内容...', onInput: (v) => console.log('Input:', v)});

    const checkRow = fbAdd.Flex({gap: '20px'});
    const crAdd = createComponentContainerProxy(checkRow.element);
    crAdd.Checkbox({label: '选项 A', checked: true});
    crAdd.Checkbox({label: '选项 B'});

    const radioRow = fbAdd.Flex({gap: '20px'});
    const rrAdd = createComponentContainerProxy(radioRow.element);
    rrAdd.Radio({label: '男', name: 'sex', checked: true});
    rrAdd.Radio({label: '女', name: 'sex'});

    basicAdd.Group({title: '选择器与滑动条'});
    const selGroup = basicAdd.Flex({gap: '15px', direction: 'column'});
    const sgAdd = createComponentContainerProxy(selGroup.element);
    sgAdd.Select({
        options: [
            {label: '苹果', value: 'apple'},
            {label: '香蕉', value: 'banana'},
            {label: '橙子', value: 'orange'}
        ]
    });
    sgAdd.Slider({min: 0, max: 100, value: 50});
    sgAdd.ColorPicker({value: '#007bff'});
    sgAdd.ProgressBar({value: 60, max: 100});

    // --- 布局组件页 ---
    const layoutTab = tabs.getChildrenHost().children[1] as HTMLElement;
    const layoutAdd = createComponentContainerProxy(layoutTab);

    layoutAdd.Group({title: 'Flex 布局 (Row)'});
    const row = layoutAdd.Row({gap: '10px'});
    const rowAdd = createComponentContainerProxy(row.element);
    for (let i = 1; i <= 3; i++) rowAdd.Button({text: `按钮 ${i}`});

    layoutAdd.Group({title: 'Flex 布局 (Column)'});
    const col = layoutAdd.Column({gap: '5px'});
    const colAdd = createComponentContainerProxy(col.element);
    for (let i = 1; i <= 3; i++) colAdd.Text({text: `文本行 ${i}`});

    layoutAdd.Group({title: 'Grid 布局'});
    const grid = layoutAdd.Grid({columns: 'repeat(3, 1fr)', gap: '10px'});
    const gridAdd = createComponentContainerProxy(grid.element);
    for (let i = 1; i <= 6; i++) {
        const cell = gridAdd.Container({style: 'background: #eee; padding: 10px; text-align: center; border-radius: 4px;'});
        cell.element.innerText = `单元格 ${i}`;
    }

    layoutAdd.Divider({margin: '20px 0'});
    layoutAdd.Text({text: '分隔线之后'});

    // --- 复合组件页 ---
    const complexTab = tabs.getChildrenHost().children[2] as HTMLElement;
    const complexAdd = createComponentContainerProxy(complexTab);

    complexAdd.Alert({title: '这是一条提示信息', type: 'info' as any});

    const cardRow = complexAdd.Flex({gap: '15px'});
    const cardRowAdd = createComponentContainerProxy(cardRow.element);

    const card = cardRowAdd.Card({title: '卡片标题'});
    const cardBodyAdd = createComponentContainerProxy(card.getChildrenHost());
    cardBodyAdd.Text({text: '这是卡片的内容区域。'});
    cardBodyAdd.Button({text: '卡片操作'});

    const avatarGroup = complexAdd.Flex({gap: '10px', align: 'center', margin: '15px 0'});
    const agAdd = createComponentContainerProxy(avatarGroup.element);
    agAdd.Avatar({src: 'https://via.placeholder.com/40', size: 40});
    agAdd.Badge({content: '99+', type: 'danger' as any});

    complexAdd.Group({title: '列表与分页'});
    complexAdd.List({
        items: ['列表项目 1', '列表项目 2', '列表项目 3'],
        renderItem: (item) => {
            const el = document.createElement('div');
            el.innerText = item;
            return el;
        }
    });
    complexAdd.Pagination({current: 1, total: 50, pageSize: 10});

    complexAdd.Group({title: '树形视图'});
    complexAdd.TreeView({
        nodes: [
            {
                key: '1',
                label: '根节点',
                children: [
                    {key: '1-1', label: '子节点 1'},
                    {key: '1-2', label: '子节点 2'}
                ]
            }
        ]
    });

    // --- 表单演示页 ---
    const formTab = tabs.getChildrenHost().children[3] as HTMLElement;
    const formAdd = createComponentContainerProxy(formTab);

    formAdd.Form({
        items: [
            {label: '用户名', name: 'username', component: 'Input', props: {placeholder: '请输入'}},
            {label: '出生日期', name: 'birthday', component: 'DatePicker', props: {}},
            {label: '上传头像', name: 'avatar', component: 'FilePicker', props: {}}
        ],
        onFinish: (values) => {
            console.log('Form Values:', values);
            alert('提交成功，请看控制台');
        }
    });

    // 弹窗演示
    const modalBtn = formAdd.Button({text: '打开弹窗', margin: '20px 0'});
    modalBtn.element.onclick = () => {
        const modal = app.add.Modal({title: '演示弹窗'});
        const modalAdd = createComponentContainerProxy(modal.getChildrenHost());
        modalAdd.Text({text: '这是一个通过 Modal 组件创建的弹窗。'});
        modalAdd.Button({text: '关闭', onClick: () => modal.hide()});
        modal.show();
    };

    // 吐司演示
    formAdd.Button({
        text: '显示 Toast', onClick: () => {
            app.add.Toast({message: '这是一条通知消息', duration: 3000});
        }
    });

    // --- 响应式数据页 ---
    const signalTab = tabs.getChildrenHost().children[4] as HTMLElement;
    const signalAdd = createComponentContainerProxy(signalTab);

    const count = signal(0);
    signalAdd.Text({text: '计数值：'});
    signalAdd.Text({text: count as any}); // 组件通常支持 ISignal 作为文本

    signalAdd.Flex({margin: '10px 0', gap: '10px'}).add.Button({
        text: '点击增加',
        onClick: () => count.set(count.get() + 1)
    });

    app.renderAll();
}
