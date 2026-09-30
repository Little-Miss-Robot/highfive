import { describe, expect, it } from 'vitest';
import { MapCodec } from '../../src/implementations/serializer/MapCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'MapCodec',
    () => new MapCodec(),
    [
        new Map<unknown, unknown>(),
        new Map<unknown, unknown>([['a', 1], ['b', 2]]),
        new Map<unknown, unknown>([[1, 'a'], [2, 'b']]),
    ],
    [
        null,
        [],
        new Set([1]),
        { a: 1 },
    ],
);

describe('MapCodec', () => {
    it('rejects an entry that is not a pair and a repeated key', () => {
        const codec = new MapCodec();

        expect(() => codec.decode([['a']])).toThrow(TypeError);
        expect(() => codec.decode([['a', 1, true]])).toThrow(TypeError);
        expect(() => codec.decode([['a', 1], ['a', 2]])).toThrow(TypeError);
    });
});
