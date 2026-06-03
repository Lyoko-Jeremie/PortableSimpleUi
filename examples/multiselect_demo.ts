import {AppRoot, createZoneWrapper} from '../src/index';

const zone = createZoneWrapper('multiselect-demo');
const root = document.getElementById('root') || document.body;

const app = new AppRoot(root, {
    zoneWrapper: zone,
    styleIsolation: { mode: 'none' }
});

const container = app.add.Column({
    style: {
        padding: '20px',
        gap: '10px',
        maxWidth: '400px'
    }
});

container.add.Label({ text: 'Multiselect Demo (Programming Languages)' });

const languagesValue = {
    value: ['ts'],
    get() { return this.value; },
    set(v: string[]) { 
        this.value = v; 
        console.log('Languages set to:', v); 
        statusLabel.state.text = `Current selection: ${v.join(', ')}`;
    }
};

container.add.Multiselect({
    value: languagesValue,
    placeholder: 'Select languages...',
    options: [
        { label: 'TypeScript', key: 'ts' },
        { label: 'JavaScript', key: 'js' },
        { label: 'Python', key: 'py' },
        { label: 'Java', key: 'java' },
        { label: 'C#', key: 'cs' },
        { label: 'Go', key: 'go' },
        { label: 'Rust', key: 'rust' }
    ],
    onSelect: (options) => {
        console.log('Current selection options:', options);
    }
});

const statusLabel = container.add.Label({ 
    text: `Current selection: ${languagesValue.value.join(', ')}`,
    style: { fontSize: '12px', color: '#666' }
});

container.add.Label({ text: 'Dynamic Options Multiselect' });

const dynamicOptions = [
    { label: 'Option 1', key: '1' },
    { label: 'Option 2', key: '2' },
    { label: 'Option 3', key: '3' }
];

container.add.Multiselect({
    placeholder: 'Select from dynamic list...',
    options: () => dynamicOptions,
    onSelect: (selected) => {
        console.log('Dynamic multiselect selected:', selected);
    }
});
