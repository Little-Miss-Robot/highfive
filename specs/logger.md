# Logger

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Logger` accepts informational, warning, and error messages.

## Interface

```ts
enum LogLevel {
    ERROR = 0,
    WARNING = 1,
    INFO = 2,
}

interface Logger {
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
    log(level: LogLevel, message: string): void;
}
```

## Requirements

1. `error`, `warning`, `info`, and `log` **MUST** be synchronous and **MUST** return `undefined`.
2. `error` **MUST** accept a string message. `warning` and `info` **MUST** do the same.
3. `log` **MUST** accept `LogLevel.ERROR`, `LogLevel.WARNING`, and `LogLevel.INFO` together with a string message.
4. `error` **SHOULD** have the same effect as `log(LogLevel.ERROR, message)`. The same **SHOULD** hold for `warning` with `LogLevel.WARNING`, and for `info` with `LogLevel.INFO`.

An implementation **MAY** write the message somewhere, and it **MAY** discard every message. Discarding still satisfies requirements 1 through 3.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testLoggerContract` checks requirements 1 through 3.
