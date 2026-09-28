# HttpClient

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`HttpClient` sends `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.

## Interface

```ts
type HttpOptions = Omit<RequestInit, 'method' | 'body'>;

type HttpBodyOptions = HttpOptions & {
    body?: BodyInit | null;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpClient {
    get(url: string, options?: HttpOptions): Promise<Response>;
    post(url: string, options?: HttpBodyOptions): Promise<Response>;
    put(url: string, options?: HttpBodyOptions): Promise<Response>;
    patch(url: string, options?: HttpBodyOptions): Promise<Response>;
    delete(url: string, options?: HttpBodyOptions): Promise<Response>;
}
```

`get` takes `HttpOptions`, which has no body. The other methods take `HttpBodyOptions`, which **MAY** include a body.

## Requirements

1. Every method **MUST** return a promise.
2. `get` **MUST** send `GET`, `post` **MUST** send `POST`, `put` **MUST** send `PUT`, `patch` **MUST** send `PATCH`, and `delete` **MUST** send `DELETE`.
3. Each method **MUST** send the `url` argument as the request URL.
4. When `options` is omitted, the method **MUST** still send the request.
5. A method **MUST** forward headers from `options` onto the request.
6. `post`, `put`, `patch`, and `delete` **MUST** forward `options.body` onto the request.
7. A method **MUST** forward `options.signal` onto the request when the caller provides one.
8. When the exchange fulfills with a `Response`, the method **MUST** fulfill with that same `Response` object.
9. The method **MUST** wait until the exchange settles. It **MUST NOT** fulfill before the exchange does.
10. When the exchange rejects, the method **MUST** reject with that same reason.

How an implementation decides that an exchange has produced a `Response` is implementation-defined. This specification does not require a method to reject when the HTTP status is outside the 2xx range. An implementation **MAY** reject for those statuses before requirement 8 applies.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testHttpClientContract` checks those requirements. The suite builds a client around a handler that stands in for the exchange, and it inspects the request that handler receives.
