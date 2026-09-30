import { describe, expect, it } from 'vitest';
import { Uint8ArrayCodec } from '../../src/implementations/serializer/Uint8ArrayCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'Uint8ArrayCodec',
    () => new Uint8ArrayCodec(),
    [
        new Uint8Array(),
        new Uint8Array([0, 255, 16]),
        new Uint8Array([1, 2, 3, 4]).subarray(1, 3),
    ],
    [
        null,
        [1, 2],
        new ArrayBuffer(2),
        'bytes',
    ],
);

describe('Uint8ArrayCodec', () => {
    it('rejects a byte outside 0 through 255 and a detached view', () => {
        const codec = new Uint8ArrayCodec();
        const buffer = new ArrayBuffer(4);
        const bytes = new Uint8Array(buffer);

        structuredClone(buffer, { transfer: [buffer] });

        expect(codec.supports(bytes)).toBe(true);
        expect(() => codec.encode(bytes)).toThrow(TypeError);
        expect(() => codec.decode([256])).toThrow(TypeError);
        expect(() => codec.decode([-1])).toThrow(TypeError);
        expect(() => codec.decode([1.5])).toThrow(TypeError);
        expect(() => codec.decode([-0])).toThrow(TypeError);
    });
});
