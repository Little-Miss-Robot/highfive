import type { SerializationCodec } from '@contracts/serializer/Serializer';

function bytesFromSerialized(value: unknown): number[] {
    if (!Array.isArray(value)) {
        throw new TypeError('Expected a serialized ArrayBuffer');
    }

    return value.map((byte) => {
        if (
            typeof byte !== 'number'
            || Object.is(byte, -0)
            || !Number.isInteger(byte)
            || byte < 0
            || byte > 255
        ) {
            throw new TypeError('Invalid serialized ArrayBuffer');
        }

        return byte;
    });
}

export class ArrayBufferCodec implements SerializationCodec<ArrayBuffer> {
    readonly type = 'builtin/ArrayBuffer@1';

    public decode(value: unknown): ArrayBuffer {
        const bytes = bytesFromSerialized(value);
        const buffer = new ArrayBuffer(bytes.length);

        new Uint8Array(buffer).set(bytes);

        return buffer;
    }

    public encode(value: ArrayBuffer): unknown {
        try {
            return Array.from(new Uint8Array(value));
        }
        catch {
            throw new TypeError('Cannot serialize a detached ArrayBuffer');
        }
    }

    public supports(value: unknown): value is ArrayBuffer {
        return value instanceof ArrayBuffer;
    }
}
