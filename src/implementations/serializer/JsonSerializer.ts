import type { CodecRegistry, SerializationCodec, Serializer } from '@contracts/serializer/Serializer';

type SerializedNode =
    | { kind: 'null' }
    | { kind: 'boolean', value: boolean }
    | { kind: 'number', value: number }
    | { kind: 'string', value: string }
    | { kind: 'array', value: SerializedNode[] }
    | { kind: 'object', value: Record<string, SerializedNode> }
    | { kind: 'typed', type: string, value: SerializedNode };

interface RegisteredCodec {
    supports: (value: unknown) => boolean
    encode: (value: unknown) => unknown
    decode: (value: unknown) => unknown
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === 'object'
        && value !== null
        && !Array.isArray(value)
    );
}

export class JsonSerializer implements Serializer, CodecRegistry {
    private readonly codecs = new Map<string, RegisteredCodec>();

    constructor(codecs: SerializationCodec<any>[] = []) {
        codecs.forEach(codec => this.register(codec));
    }

    public register<T>(codec: SerializationCodec<T>): void {
        if (codec.type.length === 0) {
            throw new TypeError('A codec must have a type identifier');
        }

        if (this.codecs.has(codec.type)) {
            throw new TypeError(
                `A codec is already registered for "${codec.type}"`,
            );
        }

        this.codecs.set(codec.type, {
            supports: value => codec.supports(value),

            encode: (value) => {
                if (!codec.supports(value)) {
                    throw new TypeError(
                        `Codec "${codec.type}" does not support this value`,
                    );
                }

                return codec.encode(value);
            },

            decode: value => codec.decode(value),
        });
    }

    public serialize(value: unknown): string {
        const ancestors = new WeakSet<object>();

        return JSON.stringify(this.encode(value, ancestors));
    }

    public deserialize<T = unknown>(serialized: string): T {
        const parsed: unknown = JSON.parse(serialized);

        return this.decode(parsed) as T;
    }

    private encode(
        value: unknown,
        ancestors: WeakSet<object>,
    ): SerializedNode {
        const isObject = typeof value === 'object' && value !== null;

        if (isObject) {
            if (ancestors.has(value)) {
                throw new TypeError(
                    'Cannot serialize a circular reference',
                );
            }

            ancestors.add(value);
        }

        try {
            for (const [type, codec] of this.codecs) {
                if (codec.supports(value)) {
                    return {
                        kind: 'typed',
                        type,
                        value: this.encode(
                            codec.encode(value),
                            ancestors,
                        ),
                    };
                }
            }

            if (value === null) {
                return { kind: 'null' };
            }

            switch (typeof value) {
                case 'boolean':
                    return { kind: 'boolean', value };

                case 'string':
                    return { kind: 'string', value };

                case 'number':
                    if (
                        !Number.isFinite(value)
                        || Object.is(value, -0)
                    ) {
                        throw new TypeError(
                            'This number requires a serialization codec',
                        );
                    }

                    return { kind: 'number', value };

                case 'object':
                    if (Array.isArray(value)) {
                        return {
                            kind: 'array',
                            value: Array.from(value, item =>
                                this.encode(item, ancestors)),
                        };
                    }

                    if (
                        isRecord(value)
                        && Object.getPrototypeOf(value)
                        === Object.prototype
                    ) {
                        return {
                            kind: 'object',
                            value: Object.fromEntries(
                                Object.entries(value).map(
                                    ([key, item]) => [
                                        key,
                                        this.encode(item, ancestors),
                                    ],
                                ),
                            ),
                        };
                    }

                    throw new TypeError(
                        'This object requires a serialization codec',
                    );

                default:
                    throw new TypeError(
                        `Unsupported value type: ${typeof value}`,
                    );
            }
        }
        finally {
            if (isObject) {
                ancestors.delete(value);
            }
        }
    }

    private decode(node: unknown): unknown {
        if (!isRecord(node)) {
            throw new TypeError('Invalid serialized node');
        }

        switch (node.kind) {
            case 'null':
                return null;

            case 'boolean':
                if (typeof node.value === 'boolean') {
                    return node.value;
                }
                break;

            case 'string':
                if (typeof node.value === 'string') {
                    return node.value;
                }
                break;

            case 'number':
                if (
                    typeof node.value === 'number'
                    && Number.isFinite(node.value)
                    && !Object.is(node.value, -0)
                ) {
                    return node.value;
                }
                break;

            case 'array':
                if (Array.isArray(node.value)) {
                    return node.value.map(item => this.decode(item));
                }
                break;

            case 'object':
                if (isRecord(node.value)) {
                    return Object.fromEntries(
                        Object.entries(node.value).map(
                            ([key, item]) => [
                                key,
                                this.decode(item),
                            ],
                        ),
                    );
                }
                break;

            case 'typed':
                if (
                    typeof node.type === 'string'
                    && Object.hasOwn(node, 'value')
                ) {
                    const codec = this.codecs.get(node.type);

                    if (!codec) {
                        throw new TypeError(
                            `No codec registered for "${node.type}"`,
                        );
                    }

                    return codec.decode(this.decode(node.value));
                }
                break;
        }

        throw new TypeError('Invalid serialized node');
    }
}
