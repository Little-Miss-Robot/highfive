import { describe, expect, it } from 'vitest';
import { SetCodec } from '../../src/implementations/serializer/SetCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'SetCodec',
    () => new SetCodec(),
    [
        new Set<unknown>(),
        new Set<unknown>(['a', 'b']),
        new Set<unknown>([1, 2, 3]),
    ],
    [
        null,
        [],
        new Map([['a', 1]]),
        { a: 1 },
    ],
);

describe('SetCodec', () => {
    it('rejects a repeated value', () => {
        const codec = new SetCodec();

        expect(() => codec.decode(['a', 'a'])).toThrow(TypeError);
    });
});
