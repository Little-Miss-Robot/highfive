# Serializer

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Serializer<Value, Serialized>` converts a value to a serialized form and back. `Serialized` defaults to `string`.

## Interface

```ts
interface Serializer<Value, Serialized = string> {
    serialize(value: Value): Serialized;
    deserialize(serialized: Serialized): Value;
}
```

## Requirements

1. `serialize` **MUST** accept a `Value` and **MUST** return a `Serialized` value.
2. `deserialize` **MUST** accept that `Serialized` value and **MUST** return a `Value`.
3. For every value the implementation claims to support, `deserialize(serialize(value))` **MUST** be deeply equal to `value`.
4. The round trip **MAY** return a copy. It **MUST NOT** be required to return the same reference.
5. `serialize` and `deserialize` **MUST** be synchronous.

The serialized form itself is not specified, except that it **MUST** be a `Serialized` value and it **MUST** be accepted by `deserialize` as requirement 3 describes.

## Unspecified

This specification does not require a particular result when `deserialize` receives a value that `serialize` did not produce, or when `serialize` receives a value outside the set the implementation supports.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testSerializerContract` checks requirement 3 for the values supplied by the caller. That set **MUST** be non-empty.
