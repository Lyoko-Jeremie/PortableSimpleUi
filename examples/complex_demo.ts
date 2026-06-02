import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';

// 模拟环境
if (typeof document === 'undefined') {
    (globalThis as any).document = {
        createElement: (tag: string) => ({
            style: {},
            appendChild: () => {},
            setAttribute: () => {},
            classList: { add: () => {} },
            attachShadow: () => ({ appendChild: () => {} }),
        }),
        getElementById: () => null,
    };
    (globalThis as any).window = {
        Zone: {
            current: {
                fork: () => ({
                    run: (fn: any) => fn(),
                    parent: { run: (fn: any) => fn() }
                })
            }
        }
    };
    (globalThis as any).Zone = (globalThis as any).window.Zone;
}

const zone = createZoneWrapper('test-zone');
const el = document.createElement('div');
const appRoot = new AppRoot(el, {
    id: 'test-root',
    zoneWrapper: zone
});

console.log('Testing Complex Components...');

// Tabs
const tabs = appRoot.add.Tabs({
    items: [
        { id: '1', label: 'Tab 1' },
        { id: '2', label: 'Tab 2' }
    ]
});
console.log('Tabs created, active:', tabs.activeTabId);

// Card
const card = appRoot.add.Card({
    title: 'My Card'
});
card.add.Label({ text: 'Content inside card' });
console.log('Card created');

// Table
const table = appRoot.add.Table({
    columns: [
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' }
    ],
    dataSource: [
        { name: 'Alice', age: 20 },
        { name: 'Bob', age: 25 }
    ]
});
console.log('Table created');

// Modal
const modal = appRoot.add.Modal({
    title: 'My Modal',
    visible: false
});
console.log('Modal created, visible:', (modal as any).config.visible);

// Toast
const toast = appRoot.add.Toast({
    text: 'Hello Toast'
});
console.log('Toast created');

console.log('All complex components instantiated successfully!');
