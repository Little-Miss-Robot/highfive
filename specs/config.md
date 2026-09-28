# Config

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Config<Values>` reads a typed configuration value by key.

## Interface

```ts
interface Config<Values extends object> {
    get<Key extends keyof Values>(key: Key): Values[Key];
}
```

## Requirements

1. `Values` **MUST** be an object type.
2. `get` **MUST** accept a key of `Values` and **MUST** return the value configured for that key.
3. The returned value **MUST** be deeply equal to the configured value. It **MAY** be a copy.
4. `get` **MUST** be synchronous.

The set of keys and their values is fixed by the implementation that is under test. A conformance test supplies that set and requires it to be non-empty.

## Unspecified

This specification does not require a particular result when `key` is not part of `Values`.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testConfigContract` checks requirement 2 against the values supplied by the caller.
