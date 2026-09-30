# ErrorReporter

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119).

`ErrorReporter` accepts an error and an optional context.

## Interface

```ts
interface ErrorReportContext {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
}

interface ErrorReporter {
    report(error: unknown, context?: ErrorReportContext): void;
}
```

## Requirements

1. `report` **MUST** be synchronous and **MUST** return `undefined`.
2. `report` **MUST** accept any `unknown` value as the error.
3. `report` **MUST** accept a call that omits `context`.
4. When `context` is present, `tags` and `extra` **MAY** each be omitted. Every `tags` value **MUST** be a string. `extra` **MAY** contain any value.

An implementation **MAY** record the error and context, and it **MAY** discard them. Discarding still satisfies requirements 1 through 4.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testErrorReporterContract` checks requirements 1 through 4. The suite samples requirement 2 with an `Error`, a string, and `null`. It samples requirement 4 with `tags` alone, `extra` alone, and both together.
