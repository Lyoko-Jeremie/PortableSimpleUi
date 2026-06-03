import {AppRoot} from '../src/app-root';
import {createZoneWrapper, signal} from '../src/core';

describe('Svg', () => {
    let container: HTMLElement;
    let appRoot: AppRoot;
    const zoneWrapper = createZoneWrapper('svg-test');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        appRoot = new AppRoot(container, {
            zoneWrapper,
            styleIsolation: {mode: 'none'}
        });
    });

    afterEach(() => {
        appRoot.destroy();
        document.body.removeChild(container);
    });

    it('should render svg content', () => {
        const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>';
        const svg = appRoot.add.Svg({
            content: svgContent
        });
        appRoot.renderAll();

        const svgEl = svg.getElement().querySelector('svg');
        expect(svgEl).toBeTruthy();
        expect(svgEl?.querySelector('circle')).toBeTruthy();
    });

    it('should update svg content dynamically', () => {
        const s = signal('<svg><circle r="40" /></svg>');
        const svg = appRoot.add.Svg({
            content: s
        });
        appRoot.renderAll();

        expect(svg.getElement().querySelector('circle')).toBeTruthy();
        expect(svg.getElement().querySelector('rect')).toBeFalsy();

        s.set('<svg><rect width="100" height="100" /></svg>');
        appRoot.renderAll();

        expect(svg.getElement().querySelector('circle')).toBeFalsy();
        expect(svg.getElement().querySelector('rect')).toBeTruthy();
    });

    it('should apply width and height attributes', () => {
        const svg = appRoot.add.Svg({
            content: '<svg><circle r="40" /></svg>',
            width: 100,
            height: '50px'
        });
        appRoot.renderAll();

        const svgEl = svg.getElement().querySelector('svg');
        expect(svgEl?.getAttribute('width')).toBe('100px');
        expect(svgEl?.getAttribute('height')).toBe('50px');
    });

    it('should apply viewBox attribute', () => {
        const svg = appRoot.add.Svg({
            content: '<svg><circle r="40" /></svg>',
            viewBox: '0 0 100 100'
        });
        appRoot.renderAll();

        const svgEl = svg.getElement().querySelector('svg');
        expect(svgEl?.getAttribute('viewBox')).toBe('0 0 100 100');
    });

    it('should fetch svg from src', async () => {
        const mockSvg = '<svg><path d="M10 10" /></svg>';
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(mockSvg),
            })
        );

        const svg = appRoot.add.Svg({
            src: 'test.svg'
        });
        appRoot.renderAll();

        // fetch is async, need to wait
        await new Promise(resolve => setTimeout(resolve, 0));

        // After fetch finishes, we need to trigger another render if it wasn't automatic
        // In our Svg implementation, updateSvgContent is called after fetch.
        // But the browser might need a tick.

        const svgEl = svg.getElement().querySelector('svg');
        expect(svgEl).toBeTruthy();
        expect(svgEl?.querySelector('path')).toBeTruthy();

        (global.fetch as jest.Mock).mockClear();
    });
});
