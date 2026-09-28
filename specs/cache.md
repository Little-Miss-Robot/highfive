# Cache

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Cache` stores string values under string keys and can expire an entry after a time to live.

## Interface

```ts
interface Cache {
    get(key: string): Promise<string | undefined>;
    set(
        key: string,
        value: string,
        options?: { ttlMs?: number },
    ): Promise<void>;
    delete(key: string): Promise<void>;
}
```

## Requirements

1. `get`, `set`, and `delete` **MUST** return a promise.
2. `get` of a key that has not been stored **MUST** fulfill with `undefined`.
3. After `set` stores a string, a later `get` of that key **MUST** fulfill with the same string. This includes the empty string.
4. `get` **MUST** return the stored characters unchanged. An implementation **MUST NOT** parse or transform the string.
5. Values stored under different keys **MUST** be independent.
6. `set` of a key that already has a value **MUST** replace that value. A later `get` **MUST** fulfill with the replacement.
7. After `delete` of a stored key, `get` of that key **MUST** fulfill with `undefined`.
8. When `set` is called with a positive, finite `ttlMs`, `get` **MUST** fulfill with the stored string before that many milliseconds have elapsed, and **MUST** fulfill with `undefined` after they have elapsed.

Time in requirement 8 is the time base the implementation uses. A conformance test advances that time base directly.

## Unspecified

This specification does not require a particular result for:

- `delete` of a key that is not present
- `set` when `ttlMs` is omitted, zero, negative, `NaN`, or infinite
- whether an expired entry is removed before the next `get`

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testCacheContract` checks those requirements. The suite receives a function that advances the implementation's time base.
