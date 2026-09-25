import type { IdGenerator } from '../../identifiers/IdGenerator';
import { describe, expect, it } from 'vitest';

export function testIdGeneratorContract(
    name: string,
    createGenerator: () => IdGenerator,
): void {
    describe(`${name}: IdGenerator contract`, () => {
        it('generates a string identifier', () => {
            const generator = createGenerator();

            expect(generator.generate()).toEqual(expect.any(String));
        });

        it('generates a unique identifier on every call', () => {
            const generator = createGenerator();
            const ids = Array.from({ length: 1_000 }, () => generator.generate());

            expect(new Set(ids).size).toBe(ids.length);
        });

        it('remains unique across generator instances', () => {
            const first = createGenerator();
            const second = createGenerator();

            const ids = [
                ...Array.from({ length: 100 }, () => first.generate()),
                ...Array.from({ length: 100 }, () => second.generate()),
            ];

            expect(new Set(ids).size).toBe(ids.length);
        });
    });
}
