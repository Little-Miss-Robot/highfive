# Validator

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Validator<T>` checks an unknown value and returns a typed result. `ValidationIssue` describes one reason a value was rejected.

## Interfaces

```ts
interface ValidationIssue {
    readonly path: readonly (string | number)[];
    readonly message: string;
}

interface Validator<T> {
    validate(value: unknown): T;
}
```

`path` locates the rejected data. An empty path means the issue applies to the value as a whole. A string addresses an object property. A number addresses an array index. The path is read from the outside in.

## Requirements

1. `validate` **MUST** be synchronous.
2. `validate` **MUST** accept `unknown`.
3. When the implementation accepts `value`, `validate` **MUST** return a value deeply equal to the result the implementation defines for that input. The result **MAY** be the same reference as the input, a copy, or another value of type `T`.
4. When the implementation rejects `value`, `validate` **MUST** throw an `Error` whose `name` is `"ValidationError"`.
5. That error's `issues` property **MUST** be a non-empty array of `ValidationIssue` values.
6. Each issue's `path` **MUST** be an array of strings and numbers. The array **MAY** be empty.
7. Each issue's `message` **MUST** be a non-empty string.
8. A later `validate` of the same input on the same instance **MUST** succeed again when the input is accepted, and **MUST** throw again when the input is rejected.

The particular path and message for a rejected value are chosen by the implementation.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testValidatorContract` checks those requirements for the accepted and rejected values supplied by the caller. Both sets **MUST** be non-empty. The suite calls `validate` twice with the same value for each supplied input.
