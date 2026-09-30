# Transformer

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Transformer<In, Out>` maps a value of type `In` to a value of type `Out`.

## Interface

```ts
interface Transformer<In, Out> {
    transform(value: In): Out;
}
```

## Requirements

1. `transform` **MUST** be synchronous.
2. `transform` **MUST** accept a value of type `In`.
3. When the implementation accepts `value`, `transform` **MUST** return a value deeply equal to the result the implementation defines for that input. The result **MAY** be the same reference as the input, a copy, or another value of type `Out`.
4. A later `transform` of the same input on the same instance **MUST** return a deeply equal result.
5. When the implementation cannot represent `value` as `Out`, `transform` **MUST** throw.
6. A later `transform` of that same input on the same instance **MUST** throw again.

The exception is chosen by the implementation. An implementation **MAY** accept every value of type `In`.

## Unspecified

This specification does not require `transform` to be invertible. It does not require the output to be deeply equal to the input.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testTransformerContract` checks requirements 1, 3, and 4 for the accepted inputs supplied by the caller. That set **MUST** be non-empty. The suite calls `transform` twice with the same value for each accepted input.

When the caller supplies inputs the implementation cannot represent, the suite checks requirements 5 and 6 for those inputs. That set **MAY** be empty.
