# Tracer

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Tracer` observes an asynchronous operation and preserves that operation's result or error.

## Interface

```ts
interface Tracer {
    trace<T>(name: string, operation: () => Promise<T>): Promise<T>;
}
```

## Requirements

1. `trace` **MUST** return a promise.
2. `trace` **MUST** invoke `operation` once per call.
3. When `operation` fulfills, `trace` **MUST** fulfill with that same value.
4. When `operation` rejects, `trace` **MUST** reject with that same reason.
5. A successful `trace` **MUST NOT** prevent a later `trace` on the same instance from running and returning its own result.

An implementation **MAY** record the name, the duration, and the outcome. That recording **MUST NOT** replace or wrap the fulfilled value, and it **MUST NOT** replace the rejection reason.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testTracerContract` checks those requirements.
