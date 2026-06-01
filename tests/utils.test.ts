import { makeRef } from '../src/utils';

describe('makeRef Path Type Safety', () => {
    const context = {
        a: {
            b: [
                { c: 1 }
            ]
        },
        x: 10
    };

    it('should correctly get value by path', () => {
        const ref = makeRef(context, 'a.b.0.c');
        expect(ref()).toBe(1);
    });

    it('should correctly format value', () => {
        const ref = makeRef(context, 'x', (val) => `Value: ${val}`);
        expect(ref()).toBe('Value: 10');
    });

    it('should handle missing paths gracefully at runtime', () => {
        // @ts-expect-error
        const ref = makeRef(context, 'a.nonexistent');
        expect(ref()).toBeUndefined();
    });
});
