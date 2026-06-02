import {AppRoot} from '../src/app-root';
import {createZoneWrapper} from '../src/core';

// 模拟环境
if (typeof document === 'undefined') {
    (globalThis as any).document = {
        createElement: (tag: string) => {
            const el: any = {
                style: {},
                appendChild: (child: any) => {
                    if (el.options && child.tagName === 'OPTION') {
                        el.options.push(child);
                    }
                },
                setAttribute: () => {},
                classList: { add: () => {} },
                attachShadow: () => ({ appendChild: () => {} }),
                innerHTML: '',
                textContent: '',
                tagName: tag.toUpperCase(),
                parentElement: null,
            };
            if (tag === 'select') {
                el.options = [];
                el.value = '';
            }
            return el;
        },
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

const zone = createZoneWrapper('form-table-zone');
const el = document.createElement('div');
const appRoot = new AppRoot(el, {
    id: 'app',
    zoneWrapper: zone
});

console.log('--- Form & Table Demo ---');

const container = appRoot.add.Container({ style: { padding: '20px' } });

container.add.Form({
    items: [
        { label: 'Username', key: 'username', component: 'Input', componentConfig: { placeholder: 'Enter username' } },
        { label: 'Type', key: 'type', component: 'Select', componentConfig: { options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }] } },
    ],
    onFinish: (values) => {
        console.log('Form finished:', values);
    }
});

container.add.Divider({});

container.add.Table({
    columns: [
        { title: 'ID', key: 'id' },
        { title: 'Name', key: 'name' },
        { title: 'Status', key: 'status' }
    ],
    dataSource: [
        { id: 1, name: 'Task 1', status: 'Done' },
        { id: 2, name: 'Task 2', status: 'Pending' }
    ]
});

console.log('Demo components added.');
