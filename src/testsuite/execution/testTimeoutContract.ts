import type { Timeout } from '../../execution/Timeout';
import { describe, expect, it, vi } from 'vitest';

export function testTimeoutContract(
    name: string,
    createTimeout: () => Timeout,
): void {
    describe(`${name}: Timeout contract`, () => {
        it('returns the result when the operation finishes before the deadline', async () => {
            const result = await createTimeout().run(async (signal) => {
                expect(signal.aborted).toBe(false);
                return 'ok';
            }, 100);

            expect(result).toBe('ok');
        });

        it('rejects with the original operation error', async () => {
            const failure = new Error('failed');

            await expect(
                createTimeout().run(async () => {
                    throw failure;
                }, 100),
            ).rejects.toBe(failure);
        });

        it('rejects on timeout and aborts the operation signal', async () => {
            vi.useFakeTimers();

            try {
                let operationSignal: AbortSignal | undefined;

                const promise = createTimeout().run(async (signal) => {
                    operationSignal = signal;
                    return new Promise<never>(() => {});
                }, 50);
                const rejection = expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });

                await vi.advanceTimersByTimeAsync(50);
                await rejection;

                expect(operationSignal?.aborted).toBe(true);
            } finally {
                vi.useRealTimers();
            }
        });

        it('rejects with the external abort reason and aborts the operation signal', async () => {
            const controller = new AbortController();
            const reason = new Error('cancelled');
            let operationSignal: AbortSignal | undefined;

            const promise = createTimeout().run(async (signal) => {
                operationSignal = signal;
                return new Promise<never>(() => {});
            }, 1000, controller.signal);
            const rejection = expect(promise).rejects.toBe(reason);

            controller.abort(reason);

            await rejection;
            expect(operationSignal?.aborted).toBe(true);
        });

        it('does not start the operation when the external signal is already aborted', async () => {
            const controller = new AbortController();
            const reason = new Error('already cancelled');
            controller.abort(reason);
            let calls = 0;

            await expect(
                createTimeout().run(async () => {
                    calls++;
                    return 'ok';
                }, 100, controller.signal),
            ).rejects.toBe(reason);

            expect(calls).toBe(0);
        });

        it('rejects invalid durations without starting the operation', async () => {
            const timeout = createTimeout();
            let calls = 0;
            const operation = async () => {
                calls++;
                return 'ok';
            };

            for (const duration of [0, -1, Number.NaN, Infinity]) {
                await expect(timeout.run(operation, duration)).rejects.toBeInstanceOf(RangeError);
            }

            expect(calls).toBe(0);
        });
    });
}
