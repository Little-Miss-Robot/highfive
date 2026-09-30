import type { SerializationCodec } from '@contracts/serializer/Serializer';

function bytesFromSerialized(value: unknown): number[] {
    if (!Array.isArray(value)) {
        throw new TypeError('Expected a serialized Uint8Array');
    }

    return value.map((byte) => {
        if (
            typeof byte !== 'number'
            || Object.is(byte, -0)
            || !Number.isInteger(byte)
            || byte < 0
            || byte > 255
        ) {
            throw new TypeError('Invalid serialized Uint8Array');
        }

        return byte;
    });
}

export class Uint8ArrayCodec implements SerializationCodec<Uint8Array> {
    readonly type = 'builtin/Uint8Array@1';

    public decode(value: unknown): Uint8Array {
        return new Uint8Array(bytesFromSerialized(value));
    }

    public encode(value: Uint8Array): unknown {
        try {
            return Array.from(value);
        }
        catch {
            throw new TypeError('Cannot serialize a detached Uint8Array');
        }
    }

    public supports(value: unknown): value is Uint8Array {
        return value instanceof Uint8Array;
    }
}
