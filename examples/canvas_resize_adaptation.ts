import {createZoneWrapper, AppRoot, Canvas} from '../src/index';

async function runExample() {
    const myZone = createZoneWrapper('canvas-resize-test');

    myZone.run(() => {
        const appContainer = document.createElement('div');
        appContainer.id = 'app-root';
        document.body.appendChild(appContainer);

        const appRoot = new AppRoot(appContainer, {
            id: 'canvas-resize-app-root',
            zoneWrapper: myZone,
            style: {
                padding: '20px',
            },
        });

        appRoot.add.Label({
            text: 'Canvas Resize Adaptation Test',
            style: {fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '10px'}
        });

        const canvasComp = new Canvas({
            width: 200,
            height: 150,
            canvasStyle: {
                border: '1px solid black'
            },
            onResize: (w, h) => {
                console.log(`Canvas resized to: ${w}x${h}`);
                statusLabel.state.text = `Status: Resized to ${w}x${h}`;
            }
        }, myZone);

        appRoot.addChild(canvasComp);

        const statusLabel = appRoot.add.Label({
            text: 'Status: Initial',
            style: {display: 'block', marginTop: '10px', color: 'blue'}
        });

        appRoot.add.Button({
            text: 'Modify Canvas Element Directly (Simulate Third-party Lib)',
            style: {marginTop: '10px', display: 'block'},
            onClick: () => {
                const el = canvasComp.getCanvas();
                el.width = 300;
                el.height = 200;
                console.log('Modified canvas element directly to 300x200');

                // 外部修改后，现在需要手动触发同步或等待下一次 render
                setTimeout(() => {
                    canvasComp.syncSizeFromCanvasSize();
                    const container = canvasComp.getElement();
                    console.log(`Container size after manual sync: ${container.style.width} x ${container.style.height}`);
                }, 100);
            }
        });

        appRoot.add.Button({
            text: 'Trigger Render Sync',
            style: {marginTop: '10px', display: 'block'},
            onClick: () => {
                appRoot.renderAll();
            }
        });
    });
}

runExample().catch(console.error);
