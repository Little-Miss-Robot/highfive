import { describe, expect, it } from 'vitest';
import { BigIntCodec } from '../../src/implementations/serializer/BigIntCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'BigIntCodec',
    () => new BigIntCodec(),
    [
        0n,
        1n,
        -42n,
    ],
    [
        null,
        1,
        '1',
        1.5,
    ],
);

describe('BigIntCodec', () => {
    it('rejects a string that is not the canonical decimal form', () => {
        const codec = new BigIntCodec();

        expect(() => codec.decode('01')).toThrow(TypeError);
        expect(() => codec.decode('+1')).toThrow(TypeError);
        expect(() => codec.decode('-0')).toThrow(TypeError);
        expect(() => codec.decode('1n')).toThrow(TypeError);
    });
});
