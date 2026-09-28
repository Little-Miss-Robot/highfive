# RetryPolicy

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`RetryPolicy` runs an asynchronous operation again after failure, within a caller-supplied attempt limit.

## Interface

```ts
interface RetryOptions {
    attempts?: number;
    delayMs?: number;
    shouldRetry?: (error: unknown, failedAttempt: number) => boolean;
}

interface RetryPolicy {
    run<T>(
        operation: (attempt: number) => Promise<T>,
        options?: RetryOptions,
    ): Promise<T>;
}
```

`attempts` is the total number of times `operation` may run, including the first try. `failedAttempt` is the one-based number of the attempt that just failed.

## Requirements

1. `run` **MUST** return a promise.
2. `run` **MUST** pass a one-based attempt number to `operation`. The first call **MUST** receive `1`, and each later call **MUST** receive the next integer.
3. When `operation` fulfills, `run` **MUST** fulfill with that value and **MUST NOT** call `operation` again.
4. When `options.attempts` is a positive integer and `shouldRetry` is omitted, a rejection **MUST** cause another attempt until the operation fulfills or the number of calls reaches `attempts`.
5. When every attempt rejects, `run` **MUST** reject with the error thrown by the last attempt.
6. When `shouldRetry` returns `false`, `run` **MUST** reject with the error from that attempt and **MUST NOT** start another attempt.
7. `shouldRetry` **MUST** be called with the error from the failed attempt and with that attempt's one-based number.
8. When `options.delayMs` is `0`, `run` **MUST** start the next attempt without waiting.

When `delayMs` is greater than zero, an implementation **SHOULD** wait at least that many milliseconds between a rejection and the next attempt.

When `attempts` or `delayMs` is omitted, the value an implementation uses is implementation-defined.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testRetryPolicyContract` checks requirements 1 through 8 with `delayMs` set to `0`.
