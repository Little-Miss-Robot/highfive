import { describe, expect, it } from 'vitest';
import { DateCodec } from '../../src/implementations/serializer/DateCodec';
import { JsonSerializer } from '../../src/implementations/serializer/JsonSerializer';
import { testCodecRegistryContract, testSerializerContract } from '../../src/testsuite';

const joined = new Date('2020-01-02T03:04:05.000Z');

testSerializerContract(
    'JsonSerializer',
    () => new JsonSerializer([new DateCodec()]),
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
