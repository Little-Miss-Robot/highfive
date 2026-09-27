import type { Deduplicator } from '@contracts/execution/Deduplicator';
import { describe, expect, it } from 'vitest';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

export function testDeduplicatorContract(
    name: string,
    createDeduplicator: () => Deduplicator,
): void {
    describe(`${name}: Deduplicator contract`, () => {
        it('shares one in-flight operation for the same key', async () => {
            const deduplicator = createDeduplicator();
            const gate = deferred<string>();
            let calls = 0;

            const operation = () => {
                calls++;
                return gate.promise;
            };

            const first = deduplicator.run('key:123', operation);
            const second = deduplicator.run('key:123', operation);

            gate.resolve('Result 123');

            expect(await Promise.all([first, second]))
                .toEqual(['Result 123', 'Result 123']);
            expect(calls).toBe(1);
        });

        it('runs different keys independently', async () => {
            const deduplicator = createDeduplicator();
            const calls: string[] = [];

            const first = deduplicator.run('key:123', async () => {
                calls.push('123');
                return 'Result 123';
            });

            const second = deduplicator.run('key:456', async () => {
                calls.push('456');
                return 'Result 456';
            });

            expect(await Promise.all([first, second]))
                .toEqual(['Result 123', 'Result 456']);
            expect(calls).toEqual(['123', '456']);
        });

        it('runs the operation again after it succeeds', async () => {
            const deduplicator = createDeduplicator();
            let calls = 0;

            const operation = async () => ++calls;

            expect(await deduplicator.run('key:123', operation)).toBe(1);
            expect(await deduplicator.run('key:123', operation)).toBe(2);
            expect(calls).toBe(2);
        });

        it('shares a failure and runs the operation again afterward', async () => {
            const deduplicator = createDeduplicator();
            const gate = deferred<never>();
            const failure = new Error('Request failed');
            let calls = 0;

            const operation = () => {
                calls++;
                return gate.promise;
            };

            const first = deduplicator.run('key:123', operation);
            const second = deduplicator.run('key:123', operation);

            const results = Promise.allSettled([first, second]);
            // Reject the shared operation after both calls have been made.
            // See the helper below for a deferred promise with reject().
            gate.reject(failure);

            expect(await results).toEqual([
                { status: 'rejected', reason: failure },
                { status: 'rejected', reason: failure },
            ]);
            expect(calls).toBe(1);

            expect(await deduplicator.run('key:123', async () => {
                calls++;
                return 'recovered';
            })).toBe('recovered');

            expect(calls).toBe(2);
        });
    });
}
