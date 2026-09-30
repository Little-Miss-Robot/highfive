import type { SerializationCodec } from '@contracts/serializer/Serializer';

export class URLCodec implements SerializationCodec<URL> {
    readonly type = 'builtin/URL@1';

    public decode(value: unknown): URL {
        if (typeof value !== 'string') {
            throw new TypeError('Expected a serialized URL string');
        }

        let url: URL;

        try {
            url = new URL(value);
        }
        catch {
            throw new TypeError('Invalid serialized URL');
        }

        if (url.href !== value) {
            throw new TypeError('Invalid serialized URL');
        }

        return url;
    }

    public encode(value: URL): unknown {
        return value.href;
    }

    public supports(value: unknown): value is URL {
        return value instanceof URL;
    }
}
