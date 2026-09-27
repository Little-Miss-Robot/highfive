import type { Serializer } from '@contracts/serializer/Serializer';
import { describe, expect, it } from 'vitest';

export function testSerializerContract<Value, Serialized = string>(
    name: string,
    createSerializer: () => Serializer<Value, Serialized>,
    values: readonly Value[],
): void {
    describe(`${name}: Serializer contract`, () => {
        it('round-trips every value', () => {
            const serializer = createSerializer();

            expect(values.length).toBeGreaterThan(0);

            for (const value of values) {
                expect(serializer.deserialize(serializer.serialize(value))).toEqual(value);
            }
        });
    });
}
