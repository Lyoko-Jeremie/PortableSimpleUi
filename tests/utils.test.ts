import {makeRef, makeDataAccessor} from '../src/utils';

describe('makeRef Path Type Safety', () => {
    const context = {
        a: {
            b: [
                {c: 1}
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
        const ref = makeRef(context, 'a.nonexistent' as any);
        expect(ref()).toBeUndefined();
    });
});

describe('makeDataAccessor', () => {
    it('should correctly get and set value by path', () => {
        const context = {
            user: {
                profile: {
                    name: 'Alice'
                }
            }
        };
        const accessor = makeDataAccessor(context, 'user.profile.name');

        expect(accessor.get()).toBe('Alice');

        accessor.set('Bob');
        expect(context.user.profile.name).toBe('Bob');
        expect(accessor.get()).toBe('Bob');
    });

    it('should create objects if path does not exist during set', () => {
        const context: any = {};
        const accessor = makeDataAccessor(context, 'a.b.c');

        accessor.set(42);
        expect(context.a.b.c).toBe(42);
    });
});
