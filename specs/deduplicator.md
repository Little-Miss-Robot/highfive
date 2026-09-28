# Deduplicator

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Deduplicator` coalesces concurrent asynchronous work that shares a key.

## Interface

```ts
interface Deduplicator {
    run<T>(key: string, operation: () => Promise<T>): Promise<T>;
}
```

## Requirements

1. `run` **MUST** return a promise.
2. While an operation for a key is still in flight, another `run` with that same key **MUST NOT** call `operation` again. Every such caller **MUST** settle with the outcome of that single call.
3. When that shared operation fulfills, every caller waiting on it **MUST** fulfill with its result.
4. When that shared operation rejects, every caller waiting on it **MUST** reject with its reason.
5. `run` calls with different keys **MUST** invoke their own operations. Those calls **MUST NOT** share a result.
6. After the operation for a key has fulfilled or rejected, a later `run` with that key **MUST** call `operation` again.

Requirement 2 applies to calls that overlap in time. A call that starts after the previous operation for that key has settled is a new operation, as requirement 6 requires.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testDeduplicatorContract` checks those requirements.
