import type { SerializationCodec } from '@contracts/serializer/Serializer';

export class DateCodec implements SerializationCodec<Date> {
    readonly type = 'builtin/Date@1';

    public decode(value: unknown): Date {
        if (typeof value !== 'string') {
            throw new TypeError('Expected a serialized Date string');
        }

        const date = new Date(value);

        if (
            Number.isNaN(date.getTime())
            || date.toISOString() !== value
        ) {
            throw new TypeError('Invalid serialized Date');
        }

        return date;
    }

    public encode(value: Date): unknown {
        if (Number.isNaN(value.getTime())) {
            throw new TypeError('Cannot serialize an invalid Date');
        }

        return value.toISOString();
    }

    public supports(value: unknown): value is Date {
        return value instanceof Date;
    }
}
