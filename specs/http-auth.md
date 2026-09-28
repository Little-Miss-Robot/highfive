# HttpAuth

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`HttpAuth` transforms an HTTP request before it is sent.

## Interface

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpAuthRequest {
    method: HttpMethod;
    url: string;
    options: HttpBodyOptions;
}

interface HttpAuth {
    authorize(request: HttpAuthRequest): Promise<HttpAuthRequest>;
}
```

`HttpBodyOptions` is defined by the [HttpClient](./http-client.md) specification. `options` **MAY** include headers, a body, and an `AbortSignal`.

## Requirements

1. `authorize` **MUST** return a promise that fulfills with an `HttpAuthRequest`.
2. The fulfilled request **MUST** have a `method` of `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, or `"DELETE"`.
3. The fulfilled request **MUST** have a string `url`.
4. The fulfilled request **MUST** have an `options` object.
5. `authorize` **MUST** accept a request that carries headers, a body, and an `AbortSignal`.

An implementation **MAY** add or replace headers. It **SHOULD** leave the method, URL, body, and signal unchanged when the transformation does not need to modify them.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testHttpAuthContract` checks those requirements.
