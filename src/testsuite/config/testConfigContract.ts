import type { Config } from '@contracts/config/Config';
import { describe, expect, it } from 'vitest';

export function testConfigContract<Values extends object>(
    name: string,
    createConfig: () => Config<Values>,
    values: Values,
): void {
    describe(`${name}: Config contract`, () => {
        it('returns the configured value for each key', () => {
            const config = createConfig();
            const keys = Object.keys(values) as Array<keyof Values & string>;

            expect(keys.length).toBeGreaterThan(0);

            for (const key of keys) {
                expect(config.get(key)).toEqual(values[key]);
            }
        });
    });
}
