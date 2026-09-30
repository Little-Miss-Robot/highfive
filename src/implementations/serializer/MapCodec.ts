import type { SerializationCodec } from '@contracts/serializer/Serializer';

export class MapCodec implements SerializationCodec<Map<unknown, unknown>> {
    readonly type = 'builtin/Map@1';

    public decode(value: unknown): Map<unknown, unknown> {
        if (!Array.isArray(value)) {
            throw new TypeError('Expected a serialized Map');
        }

        const entries = new Map<unknown, unknown>();

        for (const entry of value) {
            if (!Array.isArray(entry) || entry.length !== 2) {
                throw new TypeError('Invalid serialized Map');
            }

            const [key, item] = entry;

            if (entries.has(key)) {
                throw new TypeError('Invalid serialized Map');
            }

            entries.set(key, item);
        }

        return entries;
    }

    public encode(value: Map<unknown, unknown>): unknown {
        return Array.from(value);
    }

    public supports(value: unknown): value is Map<unknown, unknown> {
        return value instanceof Map;
    }
}
