import {signal, initPortableSimpleUiZone, AppRoot} from '../src/index';

/**
 * 这是一个综合展示所有基础组件的示例
 */
async function runExample() {
    const myZone = initPortableSimpleUiZone('all-components-demo');

    myZone.run(() => {
        const appContainer = document.createElement('div');
        appContainer.id = 'app-root';
        document.body.appendChild(appContainer);

        const appRoot = new AppRoot(appContainer, {
            id: 'demo-root',
            zoneWrapper: myZone,
            style: {
                width: '600px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'sans-serif'
            }
        });

        appRoot.add.Text({
            text: 'PortableSimpleUi 基础组件展示',
            style: {fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '20px', textAlign: 'center'}
        });

        const mainLayout = appRoot.add.Flex({
            direction: 'column',
            gap: '15px'
        });

        // 1. 文本与标签
        const textSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        textSection.add.Label({text: '1. 文本与标签 (Label & Text)', style: {fontWeight: 'bold'}});
        textSection.add.Text({text: '这是一个普通的 Text 组件。'});

        // 2. 按钮
        const btnSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        btnSection.add.Label({text: '2. 按钮 (Button)', style: {fontWeight: 'bold'}});
        const clickCount = signal(0);
        btnSection.add.Button({
            text: () => `已点击 ${clickCount.value} 次`,
            onClick: () => clickCount.set(clickCount.value + 1),
            style: {padding: '8px 16px', cursor: 'pointer'}
        });

        // 3. 输入框
        const inputSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        inputSection.add.Label({text: '3. 输入框 (Input)', style: {fontWeight: 'bold'}});
        const inputText = signal('');
        inputSection.add.Input({
            placeholder: '请输入内容...',
            onInput: (val) => inputText.set(val),
            style: {padding: '5px'}
        });
        inputSection.add.Text({text: () => `输入的内容是: ${inputText.value}`, style: {fontSize: '12px', color: '#666'}});

        // 4. 复选框
        const checkboxSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        checkboxSection.add.Label({text: '4. 复选框 (Checkbox)', style: {fontWeight: 'bold'}});
        const isChecked = signal(false);
        checkboxSection.add.Checkbox({
            label: '同意条款',
            checked: isChecked,
            onChange: (val) => isChecked.set(val)
        });
        checkboxSection.add.Text({text: () => `选中状态: ${isChecked.value}`, style: {fontSize: '12px'}});

        // 5. 单选框
        const radioSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        radioSection.add.Label({text: '5. 单选框 (Radio)', style: {fontWeight: 'bold'}});
        const selectedRadio = signal('A');
        const radioContainer = radioSection.add.Flex({gap: '10px'});
        radioContainer.add.Radio({
            name: 'demo-radio',
            value: 'A',
            label: '选项 A',
            checked: () => selectedRadio.value === 'A',
            onChange: () => selectedRadio.set('A')
        });
        radioContainer.add.Radio({
            name: 'demo-radio',
            value: 'B',
            label: '选项 B',
            checked: () => selectedRadio.value === 'B',
            onChange: () => selectedRadio.set('B')
        });
        radioSection.add.Text({text: () => `当前选择: ${selectedRadio.value}`, style: {fontSize: '12px'}});

        // 6. 选择框
        const selectSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        selectSection.add.Label({text: '6. 选择框 (Select)', style: {fontWeight: 'bold'}});
        const selectedOption = signal('opt1');
        selectSection.add.Select({
            options: [
                {label: '北京', value: 'bj'},
                {label: '上海', value: 'sh'},
                {label: '广州', value: 'gz'}
            ],
            value: selectedOption,
            onChange: (val) => selectedOption.set(val)
        });

        // 7. 滑块
        const sliderSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        sliderSection.add.Label({text: '7. 滑块 (Slider)', style: {fontWeight: 'bold'}});
        const sliderValue = signal(50);
        sliderSection.add.Slider({
            min: 0,
            max: 100,
            value: sliderValue,
            onChange: (val) => sliderValue.set(val)
        });
        sliderSection.add.Text({text: () => `当前值: ${sliderValue.value}`, style: {fontSize: '12px'}});

        // 8. 颜色选择器
        const colorSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        colorSection.add.Label({text: '8. 颜色选择器 (ColorPicker)', style: {fontWeight: 'bold'}});
        const selectedColor = signal('#4caf50');
        colorSection.add.ColorPicker({
            value: selectedColor,
            onChange: (val) => selectedColor.set(val)
        });
        colorSection.add.Text({
            text: '颜色预览',
            style: {
                color: selectedColor,
                fontWeight: 'bold'
            }
        });

        // 9. 进度条
        const progressSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        progressSection.add.Label({text: '9. 进度条 (ProgressBar)', style: {fontWeight: 'bold'}});
        progressSection.add.ProgressBar({
            value: () => sliderValue.value / 100,
            color: selectedColor
        });

        // 10. 图片
        const imgSection = mainLayout.add.Flex({direction: 'column', gap: '5px'});
        imgSection.add.Label({text: '10. 图片 (Image)', style: {fontWeight: 'bold'}});
        imgSection.add.Image({
            src: 'https://via.placeholder.com/150',
            width: 150,
            height: 100,
            style: {borderRadius: '4px', border: '1px solid #ccc'}
        });
    });
}

runExample().catch(console.error);
