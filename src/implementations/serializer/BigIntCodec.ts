import type { SerializationCodec } from '@contracts/serializer/Serializer';

const canonical = /^(?:0|-?[1-9]\d*)$/;

export class BigIntCodec implements SerializationCodec<bigint> {
    readonly type = 'builtin/BigInt@1';

    public decode(value: unknown): bigint {
        if (typeof value !== 'string' || !canonical.test(value)) {
            throw new TypeError('Expected a serialized BigInt string');
        }

        return BigInt(value);
    }

    public encode(value: bigint): unknown {
        return value.toString();
    }

    public supports(value: unknown): value is bigint {
        return typeof value === 'bigint';
    }
}
