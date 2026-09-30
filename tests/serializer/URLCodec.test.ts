import { describe, expect, it } from 'vitest';
import { URLCodec } from '../../src/implementations/serializer/URLCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

const home = new URL('https://example.com/');
const page = new URL('https://example.com/a?b=1#c');

testSerializationCodecContract(
    'URLCodec',
    () => new URLCodec(),
    [
        home,
        page,
    ],
    [
        null,
        home.href,
        'https://example.com/',
        new URLSearchParams('b=1'),
    ],
);

describe('URLCodec', () => {
    it('rejects a string that is not an exact href', () => {
        const codec = new URLCodec();

        expect(() => codec.decode('not a url')).toThrow(TypeError);
        expect(() => codec.decode('https://example.com')).toThrow(TypeError);
    });
});
