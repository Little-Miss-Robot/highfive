import type { SerializationCodec } from '@contracts/serializer/Serializer';

export class URLSearchParamsCodec implements SerializationCodec<URLSearchParams> {
    readonly type = 'builtin/URLSearchParams@1';

    public decode(value: unknown): URLSearchParams {
        if (typeof value !== 'string') {
            throw new TypeError('Expected a serialized URLSearchParams string');
        }

        const params = new URLSearchParams(value);

        if (params.toString() !== value) {
            throw new TypeError('Invalid serialized URLSearchParams');
        }

        return params;
    }

    public encode(value: URLSearchParams): unknown {
        return value.toString();
    }

    public supports(value: unknown): value is URLSearchParams {
        return value instanceof URLSearchParams;
    }
}
