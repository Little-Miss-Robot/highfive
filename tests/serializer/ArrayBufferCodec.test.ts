import { describe, expect, it } from 'vitest';
import { ArrayBufferCodec } from '../../src/implementations/serializer/ArrayBufferCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

function buffer(bytes: number[]): ArrayBuffer {
    const value = new ArrayBuffer(bytes.length);

    new Uint8Array(value).set(bytes);

    return value;
}

testSerializationCodecContract(
    'ArrayBufferCodec',
    () => new ArrayBufferCodec(),
    [
        new ArrayBuffer(0),
        buffer([0, 255, 16]),
    ],
    [
        null,
        [1, 2],
        new Uint8Array([1, 2]),
        'bytes',
    ],
);

describe('ArrayBufferCodec', () => {
    it('rejects a byte outside 0 through 255 and a detached buffer', () => {
        const codec = new ArrayBufferCodec();
        const detached = new ArrayBuffer(4);

        structuredClone(detached, { transfer: [detached] });

        expect(codec.supports(detached)).toBe(true);
        expect(() => codec.encode(detached)).toThrow(TypeError);
        expect(() => codec.decode([256])).toThrow(TypeError);
        expect(() => codec.decode([-1])).toThrow(TypeError);
        expect(() => codec.decode([1.5])).toThrow(TypeError);
        expect(() => codec.decode([-0])).toThrow(TypeError);
    });
});
