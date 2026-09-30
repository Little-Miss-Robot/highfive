import { describe, expect, it } from 'vitest';
import { RegExpCodec } from '../../src/implementations/serializer/RegExpCodec';
import { testSerializationCodecContract } from '../../src/testsuite';

testSerializationCodecContract(
    'RegExpCodec',
    () => new RegExpCodec(),
    [
        /abc/,
        /a/gi,
        new RegExp(''),
    ],
    [
        null,
        'abc',
        '/abc/',
        {},
    ],
);

describe('RegExpCodec', () => {
    it('rejects an invalid pattern and flags that are not canonical', () => {
        const codec = new RegExpCodec();

        expect(() => codec.decode({ source: '(', flags: '' })).toThrow(TypeError);
        expect(() => codec.decode({ source: 'a', flags: 'ig' })).toThrow(TypeError);
        expect(() => codec.decode({ source: 'a', flags: '', extra: true })).toThrow(TypeError);
    });
});
