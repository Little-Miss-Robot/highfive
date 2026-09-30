import type { CodecRegistry, SerializationCodec, Serializer } from '@contracts/serializer/Serializer';
import { describe, expect, it } from 'vitest';

class Label {
    constructor(readonly text: string) {}
}

function labelCodec(
    type: string,
    mark: (event: string) => void,
): SerializationCodec<Label> {
    return {
        type,

        supports: (value): value is Label => value instanceof Label,

        encode: (value) => {
            mark(`encode:${type}`);

            return value.text;
        },

        decode: (value) => {
            mark(`decode:${type}`);

            if (typeof value !== 'string') {
                throw new TypeError('Expected a label string');
            }

            return new Label(value);
        },
    };
}

export function testSerializerContract<Serialized = string>(
    name: string,
    createSerializer: () => Serializer<Serialized>,
    values: readonly unknown[],
): void {
    describe(`${name}: Serializer contract`, () => {
        it('round-trips every supported value twice', () => {
            const serializer = createSerializer();

            expect(values.length).toBeGreaterThan(0);

            for (const value of values) {
                const first = serializer.serialize(value);
                const second = serializer.serialize(value);

                expect(first).not.toBeInstanceOf(Promise);
                expect(second).not.toBeInstanceOf(Promise);
                expect(serializer.deserialize(first)).toEqual(value);
                expect(serializer.deserialize(second)).toEqual(value);
            }
        });
    });
}

export function testSerializationCodecContract<T>(
    name: string,
    createCodec: () => SerializationCodec<T>,
    values: readonly T[],
    rejected: readonly unknown[],
): void {
    describe(`${name}: SerializationCodec contract`, () => {
        it('uses a non-empty type identifier', () => {
            const codec = createCodec();

            expect(codec.type).toEqual(expect.any(String));
            expect(codec.type.length).toBeGreaterThan(0);
        });

        it('restores every claimed value from its encoded form', () => {
            const codec = createCodec();

            expect(values.length).toBeGreaterThan(0);

            for (const value of values) {
                expect(codec.supports(value)).toBe(true);

                const encoded = codec.encode(value);
                const encodedAgain = codec.encode(value);

                expect(encoded).not.toBeInstanceOf(Promise);
                expect(encodedAgain).not.toBeInstanceOf(Promise);
                expect(codec.decode(encoded)).toEqual(value);
                expect(codec.decode(encodedAgain)).toEqual(value);
            }
        });

        it('rejects every value outside its claim', () => {
            const codec = createCodec();

            expect(rejected.length).toBeGreaterThan(0);

            for (const value of rejected) {
                expect(codec.supports(value)).toBe(false);
                expect(codec.supports(value)).toBe(false);
            }
        });
    });
}

export function testCodecRegistryContract<Serialized = string>(
    name: string,
    createRegistry: () => CodecRegistry & Serializer<Serialized>,
): void {
    describe(`${name}: CodecRegistry contract`, () => {
        it('round-trips a value through the registered codec', () => {
            const events: string[] = [];
            const writer = createRegistry();
            const reader = createRegistry();
            let decoded: unknown;
            const codec: SerializationCodec<Label> = {
                type: 'test/Label@1',

                supports: (value): value is Label => value instanceof Label,

                encode: (value) => {
                    events.push('encode');

                    return value.text;
                },

                decode: (value) => {
                    events.push('decode');
                    decoded = value;

                    if (typeof value !== 'string') {
                        throw new TypeError('Expected a label string');
                    }

                    return new Label(value);
                },
            };

            writer.register(codec);
            reader.register(codec);

            const restored = reader.deserialize(writer.serialize(new Label('Ada')));

            expect(restored).toEqual(new Label('Ada'));
            expect(decoded).toEqual('Ada');
            expect(events).toEqual(['encode', 'decode']);
        });

        it('uses the first codec that supports the value', () => {
            const events: string[] = [];
            const registry = createRegistry();

            registry.register(labelCodec('test/Label@1', event => events.push(event)));
            registry.register(labelCodec('test/Label@2', event => events.push(event)));

            expect(registry.deserialize(registry.serialize(new Label('Ada')))).toEqual(new Label('Ada'));
            expect(events).toEqual([
                'encode:test/Label@1',
                'decode:test/Label@1',
            ]);
        });

        it('rejects an empty type and keeps later registration working', () => {
            const registry = createRegistry();
            const codec = labelCodec('test/Label@1', () => undefined);

            expect(() => {
                registry.register({
                    ...codec,
                    type: '',
                });
            }).toThrow(TypeError);

            registry.register(codec);

            expect(registry.deserialize(registry.serialize(new Label('Ada')))).toEqual(new Label('Ada'));
        });

        it('rejects a duplicate type and keeps the original codec', () => {
            const events: string[] = [];
            const registry = createRegistry();

            registry.register(labelCodec('test/Label@1', event => events.push(event)));

            expect(() => {
                registry.register(labelCodec('test/Label@1', event => events.push(`duplicate:${event}`)));
            }).toThrow(TypeError);

            expect(registry.deserialize(registry.serialize(new Label('Ada')))).toEqual(new Label('Ada'));
            expect(events).toEqual([
                'encode:test/Label@1',
                'decode:test/Label@1',
            ]);
        });

        it('rejects a serialized value whose codec is not registered', () => {
            const writer = createRegistry();
            const reader = createRegistry();

            writer.register(labelCodec('test/Label@1', () => undefined));

            const serialized = writer.serialize(new Label('Ada'));

            expect(() => {
                reader.deserialize(serialized);
            }).toThrow(TypeError);
        });
    });
}
