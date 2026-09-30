import type { SerializationCodec } from '../../src/contracts/serializer/Serializer';
import { describe, expect, it } from 'vitest';
import { ArrayBufferCodec } from '../../src/implementations/serializer/ArrayBufferCodec';
import { BigIntCodec } from '../../src/implementations/serializer/BigIntCodec';
import { DateCodec } from '../../src/implementations/serializer/DateCodec';
import { JsonSerializer } from '../../src/implementations/serializer/JsonSerializer';
import { MapCodec } from '../../src/implementations/serializer/MapCodec';
import { RegExpCodec } from '../../src/implementations/serializer/RegExpCodec';
import { SetCodec } from '../../src/implementations/serializer/SetCodec';
import { Uint8ArrayCodec } from '../../src/implementations/serializer/Uint8ArrayCodec';
import { URLCodec } from '../../src/implementations/serializer/URLCodec';
import { URLSearchParamsCodec } from '../../src/implementations/serializer/URLSearchParamsCodec';
import { testCodecRegistryContract, testSerializerContract } from '../../src/testsuite';

const joined = new Date('2020-01-02T03:04:05.000Z');

function buffer(bytes: number[]): ArrayBuffer {
    const value = new ArrayBuffer(bytes.length);

    new Uint8Array(value).set(bytes);

    return value;
}

function codecs(): SerializationCodec<any>[] {
    return [
        new DateCodec(),
        new BigIntCodec(),
        new URLCodec(),
        new URLSearchParamsCodec(),
        new RegExpCodec(),
        new MapCodec(),
        new SetCodec(),
        new Uint8ArrayCodec(),
        new ArrayBufferCodec(),
    ];
}

testSerializerContract(
    'JsonSerializer',
    () => new JsonSerializer(codecs()),
    [
        { name: 'John', age: 26, isAdmin: false },
        { name: 'Alice', age: 39 },
        { name: 'Burt', age: 34, isAdmin: true },
        { name: 'Raymond', age: 42 },
        { name: 'Billy', age: 36 },
        null,
        false,
        0,
        '',
        ['a', 1],
        joined,
        { name: 'Ada', joined },
        [joined],
        1n,
        new URL('https://example.com/a?b=1#c'),
        new URLSearchParams('b=2&a=1'),
        /abc/gi,
        new Map<unknown, unknown>([['joined', joined]]),
        new Set<unknown>(['a', joined]),
        new Uint8Array([0, 255]),
        buffer([1, 2, 3]),
    ],
);

testCodecRegistryContract(
    'JsonSerializer',
    () => new JsonSerializer(),
);

describe('JsonSerializer', () => {
    it('rejects a value that no codec supports', () => {
        const serializer = new JsonSerializer();
        const circular: { self?: unknown } = {};
        circular.self = circular;

        const values = [
            undefined,
            1n,
            Symbol('id'),
            () => undefined,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            -0,
            new Date(),
            circular,
        ];

        for (const value of values) {
            expect(() => serializer.serialize(value)).toThrow(TypeError);
        }
    });
});
