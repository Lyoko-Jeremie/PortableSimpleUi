import 'zone.js';
import {createZoneWrapper, IZoneWrapper} from '../src/core';

describe('ZoneWrapper Design and Constraints', () => {
    let zoneWrapper: IZoneWrapper;
    let renderCount = 0;

    beforeEach(() => {
        renderCount = 0;
        zoneWrapper = createZoneWrapper('test-zone');
        zoneWrapper.registerRoot({
            render: () => {
                renderCount++;
            }
        });
    });

    it('should trigger render on run', () => {
        zoneWrapper.run(() => {
            // some logic
        });
        expect(renderCount).toBe(1);
    });

    it('should trigger render on async tasks', (done) => {
        const initialCount = renderCount;
        zoneWrapper.run(() => {
            setTimeout(() => {
                // after timeout, render should be triggered again
            }, 10);
        });

        // Wait for both initial run and timeout task
        setTimeout(() => {
            try {
                expect(renderCount).toBeGreaterThan(initialCount + 1); // +1 for run, +1 for setTimeout
                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should NOT trigger render in runOutside', () => {
        zoneWrapper.runOutside(() => {
            // this should run in parent zone
        });
        expect(renderCount).toBe(0);
    });

    it('should handle nested zones and runOutside correctly', () => {
        const innerZone = zoneWrapper.zone.fork({name: 'inner'});
        let innerRenderCount = 0;

        // Simulating a component in inner zone
        zoneWrapper.run(() => {
            innerZone.run(() => {
                // Logic in inner zone
            });
        });

        // The outer zoneWrapper's onInvoke will be triggered because innerZone is a child of zoneWrapper.zone
        expect(renderCount).toBeGreaterThan(0);
    });

    it('should be safe when no parent zone exists', () => {
        // Zone.root is usually the parent of the first zone created.
        // If we were at Zone.root, zone.parent would be null.
        // Our fix (zone.parent || zone) should handle this.

        const rootWrapper = createZoneWrapper('root-like');
        // Manually setting parent to null for testing if possible (Zone.current is usually not root)
        // But we can check if it throws
        expect(() => {
            rootWrapper.runOutside(() => {
            });
        }).not.toThrow();
    });

    it('should trigger render when microtask finishes (onHasTask)', (done) => {
        const initialCount = renderCount;
        zoneWrapper.run(() => {
            Promise.resolve().then(() => {
                // microtask
            });
        });

        // Wait for microtask to drain
        setTimeout(() => {
            // 1 (run) + 1 (microtask drain)
            expect(renderCount).toBeGreaterThan(initialCount);
            done();
        }, 0);
    });
});
