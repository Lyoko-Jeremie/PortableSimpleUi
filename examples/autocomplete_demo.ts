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
        { label: 'Apple', value: 'apple' },
        { label: 'Apricot', value: 'apricot' },
        { label: 'Banana', value: 'banana' },
        { label: 'Blueberry', value: 'blueberry' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Coconut', value: 'coconut' },
        { label: 'Date', value: 'date' },
        { label: 'Dragonfruit', value: 'dragonfruit' },
        { label: 'Elderberry', value: 'elderberry' },
        { label: 'Fig', value: 'fig' },
        { label: 'Grape', value: 'grape' },
        { label: 'Guava', value: 'guava' }
    ],
    onSelect: (option) => {
        console.log('Selected:', option);
        alert('You selected: ' + option.label);
    }
});

container.add.Label({ text: 'Async Autocomplete Demo' });

const asyncOptions = {
    value: [] as {label: string, value: any}[],
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
                    { label: 'Result A1', value: 'a1' },
                    { label: 'Result A2', value: 'a2' }
                ]);
            } else {
                asyncOptions.set([]);
            }
            // 手动触发更新，因为 options 是动态的
            app.markDirty();
        }, 500);
    }
});
