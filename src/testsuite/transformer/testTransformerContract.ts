import type { Transformer } from '@contracts/transformer/Transformer';
import { describe, expect, it } from 'vitest';

interface TransformExample<In, Out> {
    readonly value: In
    readonly expected: Out
}

function expectThrown(transform: () => unknown): void {
    try {
        transform();
    }
    catch {
        return;
    }

    expect.fail('transform should throw');
}

export function testTransformerContract<In, Out>(
    name: string,
    createTransformer: () => Transformer<In, Out>,
    accepted: readonly TransformExample<In, Out>[],
    rejected: readonly In[] = [],
): void {
    describe(`${name}: Transformer contract`, () => {
        it('returns the defined output for every accepted input', () => {
            const transformer = createTransformer();

            expect(accepted.length).toBeGreaterThan(0);

            for (const example of accepted) {
                const first = transformer.transform(example.value);
                const second = transformer.transform(example.value);

                expect(first).not.toBeInstanceOf(Promise);
                expect(second).not.toBeInstanceOf(Promise);
                expect(first).toEqual(example.expected);
                expect(second).toEqual(example.expected);
            }
        });

        if (rejected.length > 0) {
            it('throws for every input it cannot represent', () => {
                const transformer = createTransformer();

                for (const value of rejected) {
                    expectThrown(() => transformer.transform(value));
                    expectThrown(() => transformer.transform(value));
                }
            });
        }
    });
}
