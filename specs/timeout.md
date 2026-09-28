# Timeout

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Timeout` applies a deadline to an asynchronous operation and supplies an `AbortSignal` for that operation.

## Interface

```ts
interface Timeout {
    run<T>(
        operation: (signal: AbortSignal) => Promise<T>,
        durationMs: number,
        signal?: AbortSignal,
    ): Promise<T>;
}
```

`durationMs` is the deadline. `signal`, when passed, is a parent cancellation signal.

## Requirements

1. `run` **MUST** return a promise.
2. `durationMs` **MUST** be a positive, finite number. When it is `0`, negative, `NaN`, or `Infinity`, `run` **MUST** reject with a `RangeError` and **MUST NOT** call `operation`.
3. When the parent `signal` is already aborted, `run` **MUST** reject with that signal's abort reason and **MUST NOT** call `operation`.
4. Otherwise, `run` **MUST** call `operation` with an `AbortSignal` that is not aborted at the start of the call.
5. When `operation` fulfills before the deadline and before the parent signal aborts, `run` **MUST** fulfill with that value.
6. When `operation` rejects before the deadline and before the parent signal aborts, `run` **MUST** reject with that same reason.
7. When `operation` has not settled by the time `durationMs` milliseconds have elapsed, `run` **MUST** reject with an object whose `name` is `"TimeoutError"`, and the signal passed to `operation` **MUST** be aborted.
8. When the parent signal aborts while `operation` is still in flight, `run` **MUST** reject with that signal's abort reason, and the signal passed to `operation` **MUST** be aborted.

An operation **SHOULD** observe its signal and stop outstanding work when the signal aborts. An implementation of `Timeout` cannot cancel work that ignores the signal. The returned promise **MUST** still settle as requirements 7 and 8 describe.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testTimeoutContract` checks those requirements.
