export interface Serializer<Serialized = string> {
    serialize: (value: unknown) => Serialized
    deserialize: <T = unknown>(serialized: Serialized) => T
}

export interface SerializationCodec<T> {
    readonly type: string

    supports: (value: unknown) => value is T
    encode: (value: T) => unknown
    decode: (value: unknown) => T
}

export interface CodecRegistry {
    register: <T>(codec: SerializationCodec<T>) => void
}
