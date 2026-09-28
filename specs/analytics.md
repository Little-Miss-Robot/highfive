# Analytics

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Analytics` records a named event with optional scalar properties.

## Interface

```ts
type AnalyticsValue = string | number | boolean | null;
type AnalyticsPayload = Record<string, AnalyticsValue>;

interface Analytics {
    track(event: string, properties?: AnalyticsPayload): void;
}
```

## Requirements

1. `track` **MUST** accept an event name and **MUST** return `undefined`.
2. `track` **MUST** accept a call that omits `properties`.
3. When `properties` is present, every value **MUST** be a string, a number, a boolean, or `null`.
4. `track` **MUST** be synchronous. It **MUST NOT** return a promise.

What an implementation does with the event after accepting it is implementation-defined. An implementation **MAY** forward the event to another system, and it **MAY** discard it.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testAnalyticsContract` checks requirements 1, 2, and 3.
