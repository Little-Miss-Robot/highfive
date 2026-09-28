# Clock

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Clock` supplies the current time so application code can receive time from outside the process clock.

## Interface

```ts
interface Clock {
    now(): Date;
}
```

## Requirements

1. Every call to `now` **MUST** return a `Date`.
2. `now().getTime()` **MUST** be a finite number.
3. `now` **MUST** be safe to call more than once on the same instance.

The returned `Date` is that clock's current time. This specification does not require the timestamp to match the operating system's clock. Two calls **MAY** return the same timestamp, and they **MAY** return the same `Date` instance.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testClockContract` checks those requirements.
