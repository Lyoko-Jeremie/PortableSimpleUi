if (typeof (global as any).TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}

import 'zone.js';
import {Upload, Download, CopyToClipboard, QRCode} from '../src/components/operator';
import {createZoneWrapper} from '../src/core';
import {JSDOM} from 'jsdom';

describe('Operator Components', () => {
    let zoneWrapper: any;

    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>');
        (global as any).window = dom.window;
        (global as any).document = dom.window.document;
        (global as any).HTMLElement = dom.window.HTMLElement;
        (global as any).HTMLButtonElement = dom.window.HTMLButtonElement;
        (global as any).HTMLInputElement = dom.window.HTMLInputElement;
        (global as any).HTMLImageElement = dom.window.HTMLImageElement;
        (global as any).Node = dom.window.Node;
        (global as any).navigator = dom.window.navigator;
        (global as any).URL = dom.window.URL;
        (global as any).Blob = dom.window.Blob;

        zoneWrapper = createZoneWrapper('test-zone');
    });

    afterEach(() => {
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).HTMLElement;
        delete (global as any).HTMLButtonElement;
        delete (global as any).HTMLInputElement;
        delete (global as any).HTMLImageElement;
        delete (global as any).Node;
        delete (global as any).navigator;
        delete (global as any).URL;
        delete (global as any).Blob;
    });

    describe('Upload Component', () => {
        it('should render correctly', () => {
            const upload = new Upload({
                text: 'Upload File',
                accept: '.txt'
            }, zoneWrapper);
            zoneWrapper.run(() => upload.render());

            const btn = upload.getElement().querySelector('button');
            expect(btn?.textContent).toBe('Upload File');
            
            const input = upload.getElement().querySelector('input');
            expect(input?.type).toBe('file');
            expect(input?.accept).toBe('.txt');
        });

        it('should handle drop event', () => {
            const onUpload = jest.fn();
            const upload = new Upload({
                text: 'Upload File',
                onUpload: onUpload
            }, zoneWrapper);
            zoneWrapper.run(() => upload.render());

            const container = upload.getElement();
            
            // 模拟 dragover
            const dragOverEvent = new (global as any).window.CustomEvent('dragover', { bubbles: true });
            dragOverEvent.preventDefault = jest.fn();
            dragOverEvent.stopPropagation = jest.fn();
            container.dispatchEvent(dragOverEvent);
            
            expect(container.classList.contains('dragging')).toBe(true);
            expect(dragOverEvent.preventDefault).toHaveBeenCalled();

            // 模拟进入子元素（应保持 dragging 状态）
            const btn = container.querySelector('button')!;
            const dragEnterBtnEvent = new (global as any).window.CustomEvent('dragenter', { bubbles: true });
            Object.defineProperty(dragEnterBtnEvent, 'target', { value: btn });
            container.dispatchEvent(dragEnterBtnEvent);
            expect(container.classList.contains('dragging')).toBe(true);

            // 模拟从子元素离开回到容器（应保持 dragging 状态）
            const dragLeaveBtnEvent = new (global as any).window.CustomEvent('dragleave', { bubbles: true });
            Object.defineProperty(dragLeaveBtnEvent, 'target', { value: btn });
            container.dispatchEvent(dragLeaveBtnEvent);
            expect(container.classList.contains('dragging')).toBe(true);

            // 模拟离开容器
            const dragLeaveEvent = new (global as any).window.CustomEvent('dragleave', { bubbles: true });
            Object.defineProperty(dragLeaveEvent, 'target', { value: container });
            container.dispatchEvent(dragLeaveEvent);
            expect(container.classList.contains('dragging')).toBe(false);

            // 重新进入并进行 drop
            container.dispatchEvent(dragOverEvent);
            expect(container.classList.contains('dragging')).toBe(true);

            // 模拟 drop
            const dropEvent = new (global as any).window.CustomEvent('drop', { bubbles: true });
            dropEvent.preventDefault = jest.fn();
            dropEvent.stopPropagation = jest.fn();
            (dropEvent as any).dataTransfer = {
                files: [{ name: 'test.txt' }]
            };
            
            container.dispatchEvent(dropEvent);
            
            expect(container.classList.contains('dragging')).toBe(false);
            expect(onUpload).toHaveBeenCalled();
            expect(onUpload.mock.calls[0][0][0].name).toBe('test.txt');
        });
    });

    describe('Download Component', () => {
        it('should render correctly', () => {
            const download = new Download({
                text: 'Download me',
                fileName: 'test.txt',
                content: 'hello'
            }, zoneWrapper);
            zoneWrapper.run(() => download.render());

            const btn = download.getElement() as HTMLButtonElement;
            expect(btn.textContent).toBe('Download me');
        });
    });

    describe('CopyToClipboard Component', () => {
        it('should render correctly', () => {
            const copy = new CopyToClipboard({
                text: 'Copy text',
                content: 'content to copy'
            }, zoneWrapper);
            zoneWrapper.run(() => copy.render());

            const btn = copy.getElement() as HTMLButtonElement;
            expect(btn.textContent).toBe('Copy text');
        });
    });

    describe('QRCode Component', () => {
        it('should render correctly', () => {
            const qrcode = new QRCode({
                value: 'https://example.com',
                size: 200
            }, zoneWrapper);
            zoneWrapper.run(() => qrcode.render());

            const img = qrcode.getElement() as HTMLImageElement;
            expect(img.tagName).toBe('IMG');
            expect(img.src).toContain('chl=https%3A%2F%2Fexample.com');
            expect(img.width).toBe(200);
        });
    });
});
