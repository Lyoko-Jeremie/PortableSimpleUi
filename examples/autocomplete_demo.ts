import {AppRoot, createZoneWrapper} from '../src/index';

const zone = createZoneWrapper('autocomplete-demo');
const root = document.getElementById('root') || document.body;

const app = new AppRoot(root, {
    zoneWrapper: zone,
    styleIsolation: { mode: 'none' } // 方便演示样式
});

const container = app.add.Column({
    style: {
        padding: '20px',
        gap: '10px',
        maxWidth: '400px'
    }
});

container.add.Label({ text: 'Autocomplete Demo (Fruit)' });

const fruitValue = {
    value: '',
    get() { return this.value; },
    set(v: string) { this.value = v; console.log('Fruit Value set to:', v); }
};

container.add.Autocomplete({
    value: fruitValue,
    placeholder: 'Type fruit name...',
    options: [
        { label: 'Apple', key: 'apple' },
        { label: 'Apricot', key: 'apricot' },
        { label: 'Banana', key: 'banana' },
        { label: 'Blueberry', key: 'blueberry' },
        { label: 'Cherry', key: 'cherry' },
        { label: 'Coconut', key: 'coconut' },
        { label: 'Date', key: 'date' },
        { label: 'Dragonfruit', key: 'dragonfruit' },
        { label: 'Elderberry', key: 'elderberry' },
        { label: 'Fig', key: 'fig' },
        { label: 'Grape', key: 'grape' },
        { label: 'Guava', key: 'guava' }
    ],
    onSelect: (option) => {
        console.log('Selected:', option);
        alert('You selected: ' + option.label);
    }
});

container.add.Label({ text: 'Async Autocomplete Demo' });

const asyncOptions = {
    value: [] as {label: string, key: string}[],
    get() { return this.value; },
    set(v: any) { this.value = v; }
};

container.add.Autocomplete({
    placeholder: 'Search async (type "a")...',
    options: asyncOptions,
    onSearch: (query) => {
        console.log('Async searching for:', query);
        // 模拟异步加载
        setTimeout(() => {
            if (query.toLowerCase().includes('a')) {
                asyncOptions.set([
                    { label: 'Result A1', key: 'a1' },
                    { label: 'Result A2', key: 'a2' }
                ]);
            } else {
                asyncOptions.set([]);
            }
            // 手动触发更新，因为 options 是动态的
            app.markDirty();
        }, 500);
    }
});
