import { describe, expect, it } from 'vitest';
import { DateCodec } from '../../src/implementations/serializer/DateCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

const joined = new Date('2020-01-02T03:04:05.000Z');

testSerializationCodecContract(
    'DateCodec',
    () => new DateCodec(),
    [
        joined,
        new Date(0),
    ],
    [
        null,
        joined.toISOString(),
        0,
        {},
    ],
);

describe('DateCodec', () => {
    it('rejects an invalid date and an inexact string', () => {
        const codec = new DateCodec();
        const invalid = new Date(Number.NaN);

        expect(codec.supports(invalid)).toBe(true);
        expect(() => codec.encode(invalid)).toThrow(TypeError);
        expect(() => codec.decode('2020-01-02')).toThrow(TypeError);
        expect(() => codec.decode(`${joined.toISOString()} `)).toThrow(TypeError);
    });
});
