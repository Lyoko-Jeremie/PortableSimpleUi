if (typeof (global as any).TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}

import 'zone.js';
import {Radio} from '../src/components/basic';
import {createZoneWrapper} from '../src/core';
import {JSDOM} from 'jsdom';

describe('Radio Component Initial Value', () => {
    let zoneWrapper: any;

    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>');
        (global as any).window = dom.window;
        (global as any).document = dom.window.document;
        (global as any).HTMLElement = dom.window.HTMLElement;
        (global as any).HTMLInputElement = dom.window.HTMLInputElement;
        (global as any).HTMLSpanElement = dom.window.HTMLSpanElement;
        (global as any).Node = dom.window.Node;
        (global as any).CSSStyleDeclaration = dom.window.CSSStyleDeclaration;

        zoneWrapper = createZoneWrapper('test-zone');
    });

    afterEach(() => {
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).HTMLElement;
        delete (global as any).HTMLInputElement;
        delete (global as any).HTMLSpanElement;
        delete (global as any).Node;
    });

    it('should respect initial true value from dataAccessor', () => {
        const data = { checked: true };
        const dataAccessor = {
            get: () => data.checked,
            set: (v: boolean) => data.checked = v,
        };

        const radio = new Radio({
            name: 'test-radio',
            value: 'v1',
            checked: dataAccessor,
        }, zoneWrapper);

        // 模拟 ComponentContainer 中的行为：添加后调用 render
        zoneWrapper.run(() => radio.render());

        const input = radio.getElement().querySelector('input') as HTMLInputElement;
        expect(input.checked).toBe(true);
    });

    it('should respect initial false value from dataAccessor', () => {
        const data = { checked: false };
        const dataAccessor = {
            get: () => data.checked,
            set: (v: boolean) => data.checked = v,
        };

        const radio = new Radio({
            name: 'test-radio',
            value: 'v1',
            checked: dataAccessor,
        }, zoneWrapper);

        zoneWrapper.run(() => radio.render());

        const input = radio.getElement().querySelector('input') as HTMLInputElement;
        expect(input.checked).toBe(false);
    });
});
