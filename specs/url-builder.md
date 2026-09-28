# UrlBuilder

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`UrlBuilder<Routes>` builds a URL string from a typed route table.

## Interface

```ts
type RouteArgs<Definition> =
    Definition extends (...args: infer Args) => string
        ? Args
        : [];

interface UrlBuilder<Routes extends object> {
    make<Key extends keyof Routes & string>(
        key: Key,
        ...args: RouteArgs<Routes[Key]>
    ): string;
}
```

A route definition is either a string or a function that returns a string. `RouteArgs` is that function's argument list. For a string route, `RouteArgs` is an empty list, so `make` takes no arguments after the key.

## Requirements

1. `make` **MUST** return a string.
2. `make` **MUST** be synchronous.
3. For a route defined as a string, `make(key)` **MUST** return that string.
4. For a route defined as a function, `make` **MUST** forward its arguments to that function and **MUST** return the string the function returns.
5. The key **MUST** be a string key of `Routes`.

## Unspecified

This specification does not require a particular result when:

- `key` is not in the route table
- the definition for `key` is neither a string nor a function
- a route function returns a value that is not a string

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testUrlBuilderContract` checks requirements 3 and 4 against the route table supplied by the caller.
