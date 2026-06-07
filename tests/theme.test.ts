import {AppRoot, createZoneWrapper, DEFAULT_THEME_CSS, IZoneWrapper} from '../src/index';

describe('Theme and Style Isolation', () => {
    let zoneWrapper: IZoneWrapper;

    beforeAll(() => {
        zoneWrapper = createZoneWrapper('theme-test-zone');
    });

    it('should add ps-root class in none isolation mode', () => {
        zoneWrapper.run(() => {
            const container = document.createElement('div');
            const app = new AppRoot(container, {
                zoneWrapper,
                styleIsolation: {mode: 'none'}
            });
            expect(app.host.classList.contains('ps-root')).toBe(true);
        });
    });

    it('should add ps-shadow-root class and style tag in shadow mode', () => {
        zoneWrapper.run(() => {
            const container = document.createElement('div');
            const app = new AppRoot(container, {
                zoneWrapper,
                styleIsolation: {mode: 'shadow', useDefaultTheme: true}
            });
            const shadowRoot = app.host.shadowRoot!;
            expect(shadowRoot).toBeDefined();
            const rootEl = shadowRoot.querySelector('.ps-shadow-root');
            expect(rootEl).toBeDefined();

            const styleTag = shadowRoot.querySelector('style');
            expect(styleTag).toBeDefined();
            expect(styleTag!.textContent).toContain('.ps-shadow-root');
            expect(styleTag!.textContent).toContain(DEFAULT_THEME_CSS);
        });
    });

    it('should add component class names', () => {
        zoneWrapper.run(() => {
            const container = document.createElement('div');
            const app = new AppRoot(container, {
                zoneWrapper,
                styleIsolation: {mode: 'none'}
            });
            const btn = app.add.Button({text: 'Test'});
            expect(btn.getElement().classList.contains('ps-button')).toBe(true);

            const input = app.add.Input({});
            expect(input.getElement().classList.contains('ps-input')).toBe(true);

            const flex = app.add.Flex({});
            expect(flex.getElement().classList.contains('ps-flex')).toBe(true);
        });
    });

    it('should not include default theme if useDefaultTheme is false', () => {
        zoneWrapper.run(() => {
            const container = document.createElement('div');
            const app = new AppRoot(container, {
                zoneWrapper,
                styleIsolation: {mode: 'shadow', useDefaultTheme: false}
            });
            const shadowRoot = app.host.shadowRoot!;
            const styleTag = shadowRoot.querySelector('style');
            if (styleTag) {
                expect(styleTag.textContent).not.toContain(DEFAULT_THEME_CSS);
            }
        });
    });

    it('should include table stripe and hover row styles in default theme', () => {
        expect(DEFAULT_THEME_CSS).toContain('--ps-table-stripe-bg');
        expect(DEFAULT_THEME_CSS).toContain('--ps-table-hover-bg');
        expect(DEFAULT_THEME_CSS).toContain('.ps-shadow-root .ps-table tbody tr:nth-child(even), .ps-root .ps-table tbody tr:nth-child(even)');
        expect(DEFAULT_THEME_CSS).toContain('.ps-shadow-root .ps-table tbody tr:hover, .ps-root .ps-table tbody tr:hover');
    });
});
