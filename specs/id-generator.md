# IdGenerator

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`IdGenerator` generates identifiers that are unique for the application's lifetime.

## Interface

```ts
interface IdGenerator {
    generate(): string;
}
```

## Requirements

1. `generate` **MUST** return a string.
2. `generate` **MUST** be synchronous.
3. Every identifier returned by one instance **MUST** be unique among identifiers that instance has already returned during the application's lifetime.
4. Identifiers returned by separately constructed instances of the same implementation **MUST** be unique across those instances for the application's lifetime.

This specification does not require a particular string format. An implementation **MAY** return UUIDs, and it **MAY** return another unique representation.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testIdGeneratorContract` samples the uniqueness requirements with 1,000 calls on one instance and with 100 calls on each of two instances.
