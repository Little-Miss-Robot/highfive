import type { Clock } from '@contracts/clock/Clock';
import { describe, expect, it } from 'vitest';

export function testClockContract(
    name: string,
    createClock: () => Clock,
): void {
    describe(`${name}: Clock contract`, () => {
        it('returns the current date', () => {
            const now = createClock().now();

            expect(now).toBeInstanceOf(Date);
            expect(Number.isFinite(now.getTime())).toBe(true);
        });

        it('returns a date on every call', () => {
            const clock = createClock();

            expect(clock.now()).toBeInstanceOf(Date);
            expect(clock.now()).toBeInstanceOf(Date);
        });
    });
}
