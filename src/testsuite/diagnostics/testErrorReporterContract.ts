import type { ErrorReporter } from '@contracts/diagnostics/ErrorReporter';
import { describe, expect, it } from 'vitest';

export function testErrorReporterContract(
    name: string,
    createReporter: () => ErrorReporter,
): void {
    describe(`${name}: ErrorReporter contract`, () => {
        it('reports an error without context', () => {
            const reporter = createReporter();

            expect(reporter.report(new Error('unavailable'))).toBeUndefined();
            expect(reporter.report('unavailable')).toBeUndefined();
            expect(reporter.report(null)).toBeUndefined();
        });

        it('reports an error with context', () => {
            const reporter = createReporter();
            const error = new Error('unavailable');

            expect(reporter.report(error, {
                tags: { source: 'checkout' },
            })).toBeUndefined();

            expect(reporter.report(error, {
                extra: { orderId: 'order-1', attempt: 2 },
            })).toBeUndefined();

            expect(reporter.report(error, {
                tags: { source: 'checkout' },
                extra: { orderId: 'order-1' },
            })).toBeUndefined();
        });
    });
}
