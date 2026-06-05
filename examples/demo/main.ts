import './polyfill';
import {AppRoot} from '../../src/app-root';
import {computed, signal, createZoneWrapper, effect} from '../../src/core';
import {makeDataAccessor, makeRef} from "../../src";

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
        app.pauseRendering();

        // 1. Layout: Tabs
        const tabs = app.add.Tabs({
            items: [
                {id: 'basic', label: '基础组件'},
                {id: 'layout', label: '布局组件'},
                {id: 'complex', label: '复合组件'},
                {id: 'advanced', label: '高级组件'},
                {id: 'form', label: '表单演示'},
                {id: 'graphics', label: '图形组件'},
                {id: 'operator', label: '操作组件'},
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
        const graphicsTab = tabs.add.Container({});
        const operatorTab = tabs.add.Container({});
        const signalTab = tabs.add.Container({});

        // --- 基础组件页 ---

        const group1 = basicTab.add.Group({title: '按钮与文本'});
        const btnGroup = group1.add.Flex({gap: '10px', direction: 'row', alignItems: 'center'});
        btnGroup.add.Button({text: '常规按钮', onClick: () => alert('点击了按钮')});
        btnGroup.add.Button({text: '禁用按钮', disabled: true});
        btnGroup.add.Label({text: '这是一个标签'});
        btnGroup.add.Text({text: '这是普通文本'});
        btnGroup.add.Text({text: '这是禁用文本', disabled: true});

        const group2 = basicTab.add.Group({title: '表单基础'});
        const formBaseGroup = group2.add.Flex({gap: '15px', direction: 'column'});
        const dataInput = {
            v: 'alice',
            area: '这是一段多行文本\n第二行内容',
        }
        const formReadOnly = signal(false);
        formBaseGroup.add.Button({
            text: () => formReadOnly.value ? '切换为可编辑' : '切换为只读',
            onClick: () => formReadOnly.set(!formReadOnly.value),
        });
        formBaseGroup.add.Input({
            placeholder: '请输入内容...',
            value: makeRef(dataInput, 'v'),
            readOnly: () => formReadOnly.value,
            onInput: (v: string) => {
                console.log('Input:', v);
                dataInput.v = v;
            },
        });
        formBaseGroup.add.Input({
            placeholder: '这是一个只读输入框',
            value: '只读 Input 示例',
            readOnly: true
        });
        formBaseGroup.add.Input({
            placeholder: '这是一个禁用的输入框',
            disabled: true
        });
        formBaseGroup.add.Label({text: () => dataInput.v})

        const checkRow = formBaseGroup.add.Flex({gap: '20px'});
        checkRow.add.Checkbox({label: '选项 A', checked: true});
        checkRow.add.Checkbox({label: '选项 B', checked: false});

        const radioRow = formBaseGroup.add.Flex({gap: '20px'});
        radioRow.add.Radio({label: '男', name: 'sex', value: 'male', checked: true});
        radioRow.add.Radio({label: '女', name: 'sex', value: 'female', checked: false});

        formBaseGroup.add.TextArea({
            placeholder: '请输入多行内容...',
            rows: 3,
            value: makeRef(dataInput, 'area'),
            readOnly: () => formReadOnly.value,
            onInput: (v: string) => {
                console.log('TextArea:', v);
                dataInput.area = v;
            },
        });
        formBaseGroup.add.TextArea({
            placeholder: '这是一个只读文本域',
            rows: 2,
            value: '只读 TextArea 示例',
            readOnly: true
        });
        formBaseGroup.add.TextArea({
            placeholder: '这是一个禁用的文本域',
            rows: 2,
            disabled: true
        });

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

        const avatarBadgeGroup = complexTab.add.Flex({gap: '10px', alignItems: 'center', style: {margin: '15px 0'}});
        avatarBadgeGroup.add.Avatar({src: 'https://picsum.photos/40', size: 40});
        avatarBadgeGroup.add.Badge({text: '99+', color: 'red'});

        const complexGroup1 = complexTab.add.Group({title: '列表与分页'});
        complexGroup1.add.List({
            dataSource: ['列表项目 1', '列表项目 2', '列表项目 3'],
            renderItem: (item: any) => {
                const el = document.createElement('div');
                el.innerText = item;
                return el;
            }
        });
        complexGroup1.add.Pagination({current: 1, total: 50, pageSize: 10});

        const breadcrumbGroup = complexTab.add.Group({title: '面包屑 (Breadcrumb)'});
        breadcrumbGroup.add.Breadcrumb({
            items: [
                {label: '首页'},
                {label: '组件'},
                {label: '复合组件'}
            ]
        });

        const timelineGroup = complexTab.add.Group({title: '时间轴 (Timeline)'});
        timelineGroup.add.Timeline({
            items: [
                {content: '项目启动', description: '2026-01-01', color: 'green'},
                {content: '开发中', description: '2026-06-04', color: 'blue'},
                {content: '计划发布', description: '2026-12-31'}
            ]
        });

        const calendarGroup = complexTab.add.Group({title: '日历 (Calendar)'});
        calendarGroup.add.Calendar({});

        const pickerGroup = complexTab.add.Group({title: '选择器 (Pickers)'});
        const pickerFlex = pickerGroup.add.Flex({gap: '10px', direction: 'column'});
        pickerFlex.add.DatePicker({onChange: (v) => console.log('DatePicker:', v)});
        pickerFlex.add.TimePicker({onChange: (v) => console.log('TimePicker:', v)});
        pickerFlex.add.FilePicker({onChange: (v) => console.log('FilePicker:', v)});

        const complexGroupTable = complexTab.add.Group({title: '表格 (Table)'});
        complexGroupTable.add.Table({
            columns: [
                {title: 'ID', key: 'id'},
                {title: '姓名', key: 'name'},
                {title: '角色', key: 'role'},
                {title: '状态', key: 'status'}
            ],
            dataSource: [
                {id: 1, name: '张三', role: '管理员', status: '在线'},
                {id: 2, name: '李四', role: '编辑', status: '离线'},
                {id: 3, name: '王五', role: '访客', status: '在线'}
            ]
        });

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

        // --- 高级组件页 ---
        const advancedGroup1 = advancedTab.add.Group({title: '自动补全 (Autocomplete)'});
        const autoData = signal('');
        advancedGroup1.add.Autocomplete({
            id: 'auto-complete-1',
            placeholder: '输入 "a" 试试...',
            value: autoData,
            options: [
                {label: 'Apple', key: 'apple'},
                {label: 'Banana', key: 'banana'},
                {label: 'Cherry', key: 'cherry'},
                {label: 'Date', key: 'date'},
                {label: 'Elderberry', key: 'elderberry'},
                {label: 'Fig', key: 'fig'},
                {label: 'Grape', key: 'grape'},
                {label: 'Honeydew', key: 'honeydew'},
                {label: 'Kiwi', key: 'kiwi'},
                {label: 'Lemon', key: 'lemon'}
            ],
            dropdownMaxHeight: 120, // 设置较小的高度以测试滚动
            onSearch: (value: string) => console.log('Search:', value),
            onSelect: (opt) => console.log('Autocomplete Selected:', opt)
        });
        advancedGroup1.add.Label({text: computed(() => `当前输入: ${autoData.get()}`)});

        const advancedGroup2 = advancedTab.add.Group({title: '异步自动补全'});
        const asyncAutoData = signal('');
        const asyncOptions = signal<{ label: string, key: string }[]>([]);
        advancedGroup2.add.Autocomplete({
            id: 'auto-complete-2',
            placeholder: '输入内容异步加载...',
            value: asyncAutoData,
            options: asyncOptions,
            onSearch: (query) => {
                console.log('Searching for:', query);
                // 模拟异步加载
                setTimeout(myZone.wrapInZone(() => {
                    console.log('Searching setTimeout:', query);
                    if (query) {
                        asyncOptions.set([
                            {label: `${query} 1`, key: `${query}-1`},
                            {label: `${query} 2`, key: `${query}-2`},
                            {label: `${query} 3`, key: `${query}-3`},
                        ]);
                    } else {
                        asyncOptions.set([]);
                    }
                    console.log('Searching setTimeout asyncOptions', asyncOptions.get());
                }), 500);
            }
        });
        advancedGroup2.add.Label({text: computed(() => `当前输入: ${asyncAutoData.get()}`)});

        const advancedGroup3 = advancedTab.add.Group({title: '多选选择器 (Multiselect)'});
        const multiValue = signal(['apple', 'cherry']);
        advancedGroup3.add.Multiselect({
            placeholder: '请选择水果...',
            value: multiValue,
            options: [
                {label: 'Apple (苹果)', key: 'apple'},
                {label: 'Banana (香蕉)', key: 'banana'},
                {label: 'Cherry (樱桃)', key: 'cherry'},
                {label: 'Date (枣)', key: 'date'},
                {label: 'Elderberry (接骨木莓)', key: 'elderberry'},
                {label: 'Fig (无花果)', key: 'fig'},
                {label: 'Grape (葡萄)', key: 'grape'}
            ],
            onSelect: (opts) => {
                console.log('Multiselect Selected:', opts);
                multiValue.set(opts.map(o => o.key));
            }
        });
        advancedGroup3.add.Label({text: computed(() => `当前选中: ${multiValue.get().join(', ')}`)});

        // --- 表单演示页 ---

        const formExample = formTab.add.Form({
            items: [
                {label: '用户名', key: 'username', component: 'Input', componentConfig: {placeholder: '请输入用户名'}},
                {label: '邮箱', key: 'email', component: 'Input', componentConfig: {placeholder: '请输入邮箱'}},
                {label: '出生日期', key: 'birthday', component: 'DatePicker', componentConfig: {}},
                {label: '偏好时间', key: 'prefTime', component: 'TimePicker', componentConfig: {}},
                {label: '上传头像', key: 'avatar', component: 'FilePicker', componentConfig: {}}
            ],
            onFinish: (values: any) => {
                console.log('Form Values:', values);
                app.add.Toast({text: '提交成功，请看控制台', duration: 3000});
            }
        });

        // 弹窗演示
        const actionRow = formTab.add.Flex({gap: '10px', style: {margin: '20px 0'}});
        actionRow.add.Button({
            text: '打开弹窗 (Modal)',
            onClick: () => {
                const modal = app.add.Modal({title: '演示弹窗'});
                modal.add.Text({text: '这是一个通过 Modal 组件创建的弹窗。'});
                modal.add.Button({text: '关闭', onClick: () => modal.hide()});
                modal.show();
            }
        });

        actionRow.add.Button({
            text: '显示消息 (Toast)',
            onClick: () => {
                app.add.Toast({text: '这是一条通知消息', duration: 3000});
            }
        });

        // --- 图形组件页 ---
        const graphicsGroup1 = graphicsTab.add.Group({title: 'Canvas 基础'});
        const canvasWidth = signal(300);
        const canvasHeight = signal(150);

        const canvasComp = graphicsGroup1.add.Canvas({
            width: canvasWidth,
            height: canvasHeight,
            style: {
                border: '1px solid #ccc',
                marginBottom: '10px'
            }
        });

        // 演示如何操作 Canvas
        const drawOnCanvas = () => {
            const canvas = canvasComp.getCanvas();
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#007bff';
                ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText('Hello Canvas!', 20, 40);
            }
        };

        // 初始绘制
        setTimeout(myZone.wrapInZone(() => drawOnCanvas()), 100);

        const canvasControls = graphicsGroup1.add.Row({gap: '10px'});
        canvasControls.add.Button({
            text: '随机大小',
            onClick: () => {
                canvasWidth.set(Math.floor(Math.random() * 200) + 200);
                canvasHeight.set(Math.floor(Math.random() * 100) + 100);
                // 重新渲染后绘制
                setTimeout(myZone.wrapInZone(() => drawOnCanvas()), 0);
            }
        });
        canvasControls.add.Button({
            text: '重绘内容',
            onClick: () => drawOnCanvas()
        });

        const graphicsGroup2 = graphicsTab.add.Group({title: '图片组件 (Image)'});
        const imgId = signal(300);
        graphicsGroup2.add.Image({
            src: computed(() => `https://picsum.photos/id/${imgId.value}/200/100`),
            width: 200,
            height: 100,
            style: {border: '1px solid #ccc', borderRadius: '4px', display: 'block'}
        });
        graphicsGroup2.add.Button({
            text: '随机切换图片',
            style: {marginTop: '10px'},
            onClick: () => imgId.set(Math.floor(Math.random() * 500))
        });

        const graphicsGroup3 = graphicsTab.add.Group({title: 'SVG 组件 (Svg)'});
        const svgColor = signal('red');
        graphicsGroup3.add.Svg({
            content: computed(() => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${svgColor.value}" /></svg>`),
            width: 100,
            height: 100
        });

        graphicsGroup3.add.Row({gap: '10px', style: {marginTop: '10px'}}).add.Button({
            text: '切换颜色',
            onClick: () => svgColor.set(svgColor.value === 'red' ? 'blue' : 'red')
        });

        // --- 操作组件页 ---
        const operatorGroup1 = operatorTab.add.Group({title: '上传与下载'});
        const upDownRow = operatorGroup1.add.Row({gap: '10px'});

        upDownRow.add.Upload({
            text: '点击或拖拽文件上传',
            onUpload: (files) => {
                if (files && files.length > 0) {
                    const file = files[0];
                    if (file) {
                        alert(`选中了文件: ${file.name} (${files.length} 个文件)`);
                    }
                }
            }
        });

        upDownRow.add.Download({
            text: '下载文本文件',
            fileName: 'hello.txt',
            content: 'Hello, world! This is a file from PortableSimpleUi.'
        });

        const operatorGroup2 = operatorTab.add.Group({title: '剪贴板与二维码'});
        const copyQrRow = operatorGroup2.add.Row({gap: '20px', alignItems: 'flex-start'});

        copyQrRow.add.CopyToClipboard({
            text: '复制测试文本',
            content: 'PortableSimpleUi is awesome!',
            onCopy: (content, success) => {
                alert(success ? `成功复制: ${content}` : '复制失败');
            }
        });

        // copyQrRow.add.QRCode({
        //     value: 'https://github.com/KinkiestDungeon/PortableSimpleUi',
        //     size: 150
        // });

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

        app.resumeRendering(true);
        // app.renderAll();
    });
}
