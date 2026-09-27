import type { Analytics } from '@contracts/analytics/Analytics';
import { describe, expect, it } from 'vitest';

export function testAnalyticsContract(
    name: string,
    createAnalytics: () => Analytics,
): void {
    describe(`${name}: Analytics contract`, () => {
        it('records an event without properties', () => {
            expect(createAnalytics().track('signed_in')).toBeUndefined();
        });

        it('records an event with scalar properties', () => {
            expect(createAnalytics().track('signed_in', {
                userId: 'user-1',
                attempts: 2,
                remembered: true,
                referrer: null,
            })).toBeUndefined();
        });
    });
}
