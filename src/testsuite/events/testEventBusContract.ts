import type { EventBus } from '@contracts/events/EventBus';
import { describe, expect, it } from 'vitest';

export interface EventBusContractEvents {
    created: { id: string }
    cleared: undefined
}

export function testEventBusContract(
    name: string,
    createBus: () => EventBus<EventBusContractEvents>,
): void {
    describe(`${name}: EventBus contract`, () => {
        it('passes the event payload to the listener', () => {
            const bus = createBus();
            const payloads: Array<EventBusContractEvents['created']> = [];

            bus.on('created', (payload) => {
                payloads.push(payload);
            });
            bus.emit('created', { id: 'user-1' });

            expect(payloads).toEqual([{ id: 'user-1' }]);
        });

        it('passes an undefined payload through', () => {
            const bus = createBus();
            const payloads: Array<undefined | 'missing'> = [];

            bus.on('cleared', (payload) => {
                payloads.push(payload);
            });
            bus.emit('cleared', undefined);

            expect(payloads).toEqual([undefined]);
        });

        it('delivers an event to every listener', () => {
            const bus = createBus();
            const seen: string[] = [];

            bus.on('created', () => {
                seen.push('first');
            });
            bus.on('created', () => {
                seen.push('second');
            });
            bus.emit('created', { id: 'user-1' });

            expect(seen).toHaveLength(2);
            expect(seen).toContain('first');
            expect(seen).toContain('second');
        });

        it('keeps events independent', () => {
            const bus = createBus();
            const created: Array<EventBusContractEvents['created']> = [];
            let cleared = 0;

            bus.on('created', (payload) => {
                created.push(payload);
            });
            bus.on('cleared', () => {
                cleared++;
            });

            bus.emit('created', { id: 'user-1' });

            expect(created).toEqual([{ id: 'user-1' }]);
            expect(cleared).toBe(0);

            bus.emit('cleared', undefined);

            expect(created).toEqual([{ id: 'user-1' }]);
            expect(cleared).toBe(1);
        });

        it('stops delivering after unsubscribe', () => {
            const bus = createBus();
            let calls = 0;
            const unsubscribe = bus.on('created', () => {
                calls++;
            });

            bus.emit('created', { id: 'user-1' });
            unsubscribe();
            bus.emit('created', { id: 'user-2' });

            expect(calls).toBe(1);
        });

        it('leaves other listeners in place when one unsubscribes', () => {
            const bus = createBus();
            let first = 0;
            let second = 0;
            const unsubscribe = bus.on('created', () => {
                first++;
            });

            bus.on('created', () => {
                second++;
            });
            unsubscribe();
            bus.emit('created', { id: 'user-1' });

            expect(first).toBe(0);
            expect(second).toBe(1);
        });

        it('ignores an event that has no listeners', () => {
            expect(() => {
                createBus().emit('created', { id: 'user-1' });
            }).not.toThrow();
        });

        it('propagates a listener error from emit', () => {
            const bus = createBus();
            const failure = new Error('listener failed');

            bus.on('created', () => {
                throw failure;
            });

            let thrown: unknown;

            try {
                bus.emit('created', { id: 'user-1' });
            }
            catch (error) {
                thrown = error;
            }

            expect(thrown).toBe(failure);
        });
    });
}
