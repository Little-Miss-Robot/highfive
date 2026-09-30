import { describe, expect, it } from 'vitest';
import { URLSearchParamsCodec } from '../../src/implementations/serializer/URLSearchParamsCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'URLSearchParamsCodec',
    () => new URLSearchParamsCodec(),
    [
        new URLSearchParams(),
        new URLSearchParams('b=2&a=1&a=3'),
    ],
    [
        null,
        'a=1',
        new URL('https://example.com/'),
        [],
    ],
);

describe('URLSearchParamsCodec', () => {
    it('rejects a string that is not the canonical query form', () => {
        const codec = new URLSearchParamsCodec();

        expect(() => codec.decode('a=b%20c')).toThrow(TypeError);
        expect(() => codec.decode('?a=1')).toThrow(TypeError);
    });
});
