import type { Tracer } from '@contracts/diagnostics/Tracer';
import { describe, expect, it } from 'vitest';

export function testTracerContract(
    name: string,
    createTracer: () => Tracer,
): void {
    describe(`${name}: Tracer contract`, () => {
        it('returns the operation result', async () => {
            const value = { id: 'user-1' };

            await expect(createTracer().trace('load-user', async () => value)).resolves.toBe(value);
        });

        it('invokes the operation once', async () => {
            let calls = 0;

            await createTracer().trace('load-user', async () => {
                calls++;
                return 'ok';
            });

            expect(calls).toBe(1);
        });

        it('rejects with the original operation error', async () => {
            const failure = new Error('unavailable');
            let calls = 0;

            await expect(createTracer().trace('load-user', async () => {
                calls++;
                throw failure;
            })).rejects.toBe(failure);

            expect(calls).toBe(1);
        });

        it('can trace another operation after a success', async () => {
            const tracer = createTracer();

            await expect(tracer.trace('first', async () => 'ok')).resolves.toBe('ok');
            await expect(tracer.trace('second', async () => 'also ok')).resolves.toBe('also ok');
        });
    });
}
