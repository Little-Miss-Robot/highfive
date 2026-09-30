import type { SerializationCodec } from '@contracts/serializer/Serializer';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}

export class RegExpCodec implements SerializationCodec<RegExp> {
    readonly type = 'builtin/RegExp@1';

    public decode(value: unknown): RegExp {
        if (
            !isRecord(value)
            || typeof value.source !== 'string'
            || typeof value.flags !== 'string'
            || Object.keys(value).length !== 2
        ) {
            throw new TypeError('Expected a serialized RegExp');
        }

        let pattern: RegExp;

        try {
            pattern = new RegExp(value.source, value.flags);
        }
        catch {
            throw new TypeError('Invalid serialized RegExp');
        }

        if (pattern.source !== value.source || pattern.flags !== value.flags) {
            throw new TypeError('Invalid serialized RegExp');
        }

        return pattern;
    }

    public encode(value: RegExp): unknown {
        return {
            source: value.source,
            flags: value.flags,
        };
    }

    public supports(value: unknown): value is RegExp {
        return value instanceof RegExp;
    }
}
