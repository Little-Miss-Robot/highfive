import type { SerializationCodec } from '@contracts/serializer/Serializer';

export class SetCodec implements SerializationCodec<Set<unknown>> {
    readonly type = 'builtin/Set@1';

    public decode(value: unknown): Set<unknown> {
        if (!Array.isArray(value)) {
            throw new TypeError('Expected a serialized Set');
        }

        const items = new Set<unknown>();

        for (const item of value) {
            if (items.has(item)) {
                throw new TypeError('Invalid serialized Set');
            }

            items.add(item);
        }

        return items;
    }

    public encode(value: Set<unknown>): unknown {
        return Array.from(value);
    }

    public supports(value: unknown): value is Set<unknown> {
        return value instanceof Set;
    }
}
