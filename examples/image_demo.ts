import {signal, createZoneWrapper, AppRoot} from '../src/index';

/**
 * Image 组件展示示例
 */
async function runExample() {
    const myZone = createZoneWrapper('image-demo');

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
            text: 'Image 组件展示',
            style: {fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '20px', textAlign: 'center'}
        });

        const mainLayout = appRoot.add.Flex({
            direction: 'column',
            gap: '20px'
        });

        // 1. 基础用法
        const section1 = mainLayout.add.Flex({direction: 'column', gap: '10px'});
        section1.add.Label({text: '1. 基础用法', style: {fontWeight: 'bold'}});
        section1.add.Image({
            src: 'https://picsum.photos/200/100',
            alt: 'Random Image',
            width: 200,
            height: 100,
            style: {border: '1px solid #ccc'}
        });

        // 2. 响应式更新
        const section2 = mainLayout.add.Flex({direction: 'column', gap: '10px'});
        section2.add.Label({text: '2. 响应式更新 (点击按钮切换图片)', style: {fontWeight: 'bold'}});
        
        const imageId = signal(201);
        section2.add.Image({
            src: () => `https://picsum.photos/id/${imageId.value}/200/100`,
            width: 200,
            height: 100,
            style: {borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'}
        });

        section2.add.Button({
            text: '切换下一张图片',
            onClick: () => imageId.set(imageId.value + 1),
            style: {width: '150px', padding: '5px'}
        });

        // 3. 不同的尺寸设置方式
        const section3 = mainLayout.add.Flex({direction: 'column', gap: '10px'});
        section3.add.Label({text: '3. 不同的尺寸设置方式', style: {fontWeight: 'bold'}});
        
        const sizeContainer = section3.add.Flex({gap: '15px', alignItems: 'center'});
        
        // 字符串像素值
        sizeContainer.add.Image({
            src: 'https://picsum.photos/50/50',
            width: '50px',
            height: '50px',
            style: {objectFit: 'cover'}
        });
        sizeContainer.add.Text({text: 'width: "50px"'});

        // 百分比
        const percentContainer = sizeContainer.add.Flex({
            style: {width: '100px', height: '50px', border: '1px dashed #999', position: 'relative'}
        });
        percentContainer.add.Image({
            src: 'https://picsum.photos/100/50',
            width: '100%',
            height: '100%'
        });
        sizeContainer.add.Text({text: 'width: "100%"'});

        // 4. 带样式的 Image
        const section4 = mainLayout.add.Flex({direction: 'column', gap: '10px'});
        section4.add.Label({text: '4. 带样式的图片', style: {fontWeight: 'bold'}});
        section4.add.Image({
            src: 'https://picsum.photos/150/150',
            width: 150,
            height: 150,
            style: {
                borderRadius: '50%',
                border: '4px solid #4caf50',
                padding: '4px',
                backgroundColor: '#fff'
            }
        });
    });
}

runExample().catch(console.error);
