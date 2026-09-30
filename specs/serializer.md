# Serializer, SerializationCodec, and CodecRegistry

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Serializer<Serialized>` converts a value to a serialized form and back. `Serialized` defaults to `string`. `SerializationCodec<T>` preserves a value that the serialized form cannot represent on its own. `CodecRegistry` makes those codecs available to a serializer.

## Interfaces

```ts
interface Serializer<Serialized = string> {
    serialize(value: unknown): Serialized;
    deserialize<T = unknown>(serialized: Serialized): T;
}

interface SerializationCodec<T> {
    readonly type: string;
    supports(value: unknown): value is T;
    encode(value: T): unknown;
    decode(value: unknown): T;
}

interface CodecRegistry {
    register<T>(codec: SerializationCodec<T>): void;
}
```

The type parameter on `deserialize` selects the static return type. The restored value is the result of deserialization.

`type` identifies the codec inside a serialized value. `supports` reports whether the codec claims a value. `encode` returns the representation to store. `decode` restores `T` from that representation.

## Serializer

1. `serialize` and `deserialize` **MUST** be synchronous.
2. `serialize` **MUST** accept `unknown` and **MUST** return a `Serialized` value.
3. `deserialize` **MUST** accept that `Serialized` value and **MUST** return the restored value.
4. For every value the implementation claims to support, `deserialize(serialize(value))` **MUST** be deeply equal to `value`.
5. The round trip **MAY** return a copy. It **MUST NOT** be required to return the same reference.
6. A later round trip of the same value on the same instance **MUST** again be deeply equal to `value`.

The serialized form itself is unspecified, except that it **MUST** be a `Serialized` value and `deserialize` **MUST** accept it as requirement 4 describes.

## SerializationCodec

1. `supports`, `encode`, and `decode` **MUST** be synchronous.
2. `type` **MUST** be a non-empty string.
3. `supports` **MUST** return `true` for every value the codec claims.
4. `supports` **MUST** return `false` for every value the codec rejects.
5. For every claimed value that `encode` accepts, `decode` **MUST** return a value deeply equal to the original when called with a value deeply equal to `encode(value)`.
6. A later `encode` and `decode` of the same value **MUST** succeed again.
7. `encode` **MAY** throw when a claimed value cannot be represented.

## CodecRegistry

A `CodecRegistry` is used together with a `Serializer`. Registration order is the order of `register` calls.

1. `register` **MUST** be synchronous.
2. `register` **MUST** throw a `TypeError` when `type` is an empty string.
3. `register` **MUST** throw a `TypeError` when a codec with the same `type` is already registered.
4. A failed `register` **MUST** leave the previously registered codecs in place.
5. When several registered codecs support the same value, serialization **MUST** use the one registered first. Later codecs **MUST NOT** encode or decode that value.
6. Serializing a supported value **MUST** call that codec's `encode` with the original value.
7. The serialized form **MUST** carry that codec's `type`.
8. Deserializing that form **MUST** call `decode` with a value deeply equal to the value `encode` returned.
9. `deserialize(serialize(value))` **MUST** then be deeply equal to `value`.
10. Another instance that has registered the same codec **MUST** be able to deserialize that form to a deeply equal value.
11. An instance that has not registered that `type` **MUST** throw a `TypeError` when deserializing that form.

## Unspecified

This specification does not require a particular result when `serialize` receives a value the implementation does not claim to support and no registered codec supports. It does not require a particular result when `deserialize` receives a `Serialized` value that `serialize` did not produce, except for requirement 11 of `CodecRegistry`. It does not require a particular representation from `encode`, except that `decode` can restore the original value from it.

## Conformance

An implementation conforms to this specification when it satisfies the requirements for the interfaces it implements.

`testSerializerContract` checks Serializer requirements 1, 4, and 6 for the values supplied by the caller. That set **MUST** be non-empty. The suite round-trips each value twice.

`testSerializationCodecContract` checks SerializationCodec requirements 1 through 6 for the claimed and rejected values supplied by the caller. Both sets **MUST** be non-empty. The suite encodes and decodes each claimed value twice.

`testCodecRegistryContract` checks the CodecRegistry requirements. The suite registers a codec that encodes a small value as a string. The implementation **MUST** support that string as the codec representation.
