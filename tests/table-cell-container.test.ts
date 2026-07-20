import {AppRoot, Button, createZoneWrapper} from '../src';

interface TableRow {
    id: number;
    name: string;
    action: null;
}

describe('Table cell component containers', () => {
    let host: HTMLElement;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        host.remove();
    });

    it('adds PortableSimpleUi components from a cell renderer', () => {
        const zoneWrapper = createZoneWrapper('table-cell-components');
        const app = new AppRoot(host, {zoneWrapper});
        let selected: TableRow | undefined;

        const row: TableRow = {id: 1, name: 'Potion', action: null};
        app.add.Table<TableRow>({
            columns: [
                {title: 'Name', key: 'name'},
                {
                    title: 'Action',
                    key: 'action',
                    render: (_value, record, cell) => {
                        cell.add.Badge({text: record.id});
                        cell.add.Button({
                            text: 'Use',
                            onClick: () => {
                                selected = record;
                            }
                        });
                    }
                }
            ],
            dataSource: [row]
        });

        const cells = host.querySelectorAll('tbody td');
        const actionCell = cells[1] as HTMLTableCellElement;
        expect(actionCell.querySelector('.ps-badge')?.textContent).toBe('1');

        const button = actionCell.querySelector('button') as HTMLButtonElement;
        expect(button.textContent).toBe('Use');
        button.click();
        expect(selected).toBe(row);
    });

    it('destroys old cell components before rebuilding the table', () => {
        const zoneWrapper = createZoneWrapper('table-cell-destroy');
        const app = new AppRoot(host, {zoneWrapper});
        const renderedButtons: Button[] = [];

        const table = app.add.Table<TableRow>({
            columns: [
                {
                    title: 'Action',
                    key: 'action',
                    render: (_value, _record, cell) => {
                        renderedButtons.push(cell.add.Button({text: 'Action'}));
                    }
                }
            ],
            dataSource: [{id: 1, name: 'Potion', action: null}]
        });

        const oldButton = [...renderedButtons]
            .reverse()
            .find(button => button.getElement().isConnected)!;
        const renderCount = renderedButtons.length;
        expect(oldButton.parentComponent).toBe(table);
        expect(oldButton.getElement().isConnected).toBe(true);

        table.render();

        expect(oldButton.parentComponent).toBeNull();
        expect(oldButton.getElement().isConnected).toBe(false);
        expect(renderedButtons.length).toBeGreaterThan(renderCount);
    });

    it('keeps legacy string and HTMLElement renderer results', () => {
        const zoneWrapper = createZoneWrapper('table-cell-legacy-render');
        const app = new AppRoot(host, {zoneWrapper});

        app.add.Table<TableRow>({
            columns: [
                {
                    title: 'Name',
                    key: 'name',
                    render: value => `Item: ${value}`
                },
                {
                    title: 'Action',
                    key: 'action',
                    render: () => {
                        const strong = document.createElement('strong');
                        strong.textContent = 'Ready';
                        return strong;
                    }
                }
            ],
            dataSource: [{id: 1, name: 'Potion', action: null}]
        });

        const cells = host.querySelectorAll('tbody td');
        expect(cells[0]?.textContent).toBe('Item: Potion');
        expect(cells[1]?.querySelector('strong')?.textContent).toBe('Ready');
    });
});
