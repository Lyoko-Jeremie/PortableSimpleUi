import {AppRoot, createZoneWrapper} from '../src';

export function runComponentTreeDemo(parentElement: HTMLElement = document.body): AppRoot {
    const host = document.createElement('div');
    host.id = 'component-tree-demo';
    parentElement.appendChild(host);

    const app = new AppRoot(host, {
        id: 'component-tree-root',
        zoneWrapper: createZoneWrapper('component-tree-demo')
    });

    const panel = app.add.Flex({
        id: 'panel',
        direction: 'column',
        gap: '8px'
    });
    const row = panel.add.Row({id: 'row', gap: '8px'});
    const button = row.add.Button({id: 'leaf-button', text: 'Leaf button'});

    const parentIds = button.getParentComponents().map(component => component.config.id ?? '(no id)');
    const root = button.getAppRoot();

    console.log('Leaf parent chain:', parentIds.join(' -> '));
    console.log('Leaf AppRoot id:', root?.config.id);

    return app;
}

if (typeof document !== 'undefined') {
    runComponentTreeDemo();
}
