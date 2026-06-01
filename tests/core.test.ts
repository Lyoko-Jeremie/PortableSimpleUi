import { signal, effect, computed } from '../src/core';

describe('Signal System', () => {
    it('should work as a basic signal', () => {
        const s = signal(1);
        expect(s.get()).toBe(1);
        expect(s.value).toBe(1);

        s.set(2);
        expect(s.get()).toBe(2);
        expect(s.value).toBe(2);
    });

    it('should work with computed', () => {
        const s = signal(1);
        const double = computed(() => s.value * 2);

        expect(double()).toBe(2);

        s.set(5);
        expect(double()).toBe(10);
    });

    it('should work with effect', () => {
        const s = signal(1);
        let count = 0;

        effect(() => {
            count = s.value;
        });

        expect(count).toBe(1);

        s.set(10);
        expect(count).toBe(10);
    });
});
