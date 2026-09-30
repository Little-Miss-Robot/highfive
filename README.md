# Highfive

## A contract-first TypeScript library for building applications with interchangeable services and shared conventions.

[![npm version](https://img.shields.io/npm/v/%40littlemissrobot%2Fhighfive)](https://www.npmjs.com/package/@littlemissrobot/highfive)
[![CI](https://github.com/Little-Miss-Robot/highfive/actions/workflows/main.yml/badge.svg)](https://github.com/Little-Miss-Robot/highfive/actions/workflows/main.yml)
[![license](https://img.shields.io/npm/l/%40littlemissrobot%2Fhighfive)](./LICENSE.md)

## Installation

```sh
npm install @littlemissrobot/highfive
```

The package ships ESM and CommonJS builds with TypeScript declarations.

## Contracts

Highfive is a collection of small TypeScript contracts for application
infrastructure. Application code can depend on these interfaces instead of a
particular framework, vendor, or runtime implementation. Normative requirements
are in [`specs/`](./specs). Those documents use the key words defined by
[RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

- [Analytics](#analytics)
- [Cache](#cache)
- [Clock](#clock)
- [Config](#config)
- [Container](#container)
- [ServiceProvider](#serviceprovider)
- [Tracer](#tracer)
- [ErrorReporter](#errorreporter)
- [EventBus](#eventbus)
- [Deduplicator](#deduplicator)
- [RetryPolicy](#retrypolicy)
- [Timeout](#timeout)
- [Filesystem](#filesystem)
- [HttpAuth](#httpauth)
- [HttpClient](#httpclient)
- [IdGenerator](#idgenerator)
- [Logger](#logger)
- [UrlBuilder](#urlbuilder)
- [Notification](#notification)
- [Notifier](#notifier)
- [Serializer](#serializer)
- [SerializationCodec](#serializationcodec)
- [CodecRegistry](#codecregistry)
- [Validator](#validator)
- [Transformer](#transformer)

## Analytics

[Specification](./specs/analytics.md)

`Analytics` records a named tracking event with optional data.

`LoggerAnalytics(logger)` is the included adapter. It writes events through a
`Logger`.

## Cache

[Specification](./specs/cache.md)

`Cache` asynchronously reads, writes, and deletes string values, with optional
time-to-live support.

Included adapters:

- `InMemoryCache(clock)` stores values for the lifetime of the instance.
- `LocalStorageCache(namespace, clock)` stores values in the browser's
  `window.localStorage`, under keys prefixed with `highfive:<namespace>:`.

Both adapters expire entries lazily when they are read. A TTL must be a
positive, finite number.

```ts
import {
    InMemoryCache,
    SystemClock,
} from '@littlemissrobot/highfive';

const cache = new InMemoryCache(new SystemClock());
await cache.set('session', 'active', { ttlMs: 60_000 });
const session = await cache.get('session');
```

## Clock

[Specification](./specs/clock.md)

`Clock` returns the current `Date`, so application code can receive time from
outside the process clock.

`SystemClock` reads the system time. `AdvanceableClock` is a deterministic fake
whose time starts at the Unix epoch and can be moved forward with
`advance(durationMs)`.

## Config

[Specification](./specs/config.md)

`Config<Values>` reads a typed configuration value by key.

Highfive defines this contract and does not include a config implementation.

## Container

[Specification](./specs/container.md)

`Container<B>` binds factories, binds lazy singletons, registers providers, and
resolves services with `make`. Its type includes `dependencyTypes`, the binding
map. Implementations declare that property and do not assign it. Callers do
not read it.

`DefaultContainer` is the included implementation. Create one and register
providers in dependency order. Container usage is optional; all other
implementations can be constructed directly.

## ServiceProvider

[Specification](./specs/container.md)

`ServiceProvider<Provides, Requires>` describes the services a provider adds
and the services that provider needs before it can register them.

## Tracer

[Specification](./specs/tracer.md)

`Tracer` observes an asynchronous operation while preserving its result or
error.

`LogTracer(logger)` measures an operation with `performance.now()` and logs its
duration and success or failure through a `Logger`.

## ErrorReporter

[Specification](./specs/error-reporter.md)

`ErrorReporter` reports an error with optional context.

`ConsoleErrorReporter` writes the error and the optional context to
`console.error`.

## EventBus

[Specification](./specs/event-bus.md)

`EventBus<E>` publishes typed events and subscribes typed listeners.

`InMemoryEventBus<E>` invokes listeners synchronously in registration order.
`on` returns an unsubscribe function. Listener errors propagate from `emit`.

```ts
import { InMemoryEventBus } from '@littlemissrobot/highfive';

interface AppEvents {
    signedIn: { userId: string };
    signedOut: undefined;
}

const events = new InMemoryEventBus<AppEvents>();
const unsubscribe = events.on('signedIn', ({ userId }) => {
    console.info(userId);
});

events.emit('signedIn', { userId: 'user-123' });
unsubscribe();
```

## Deduplicator

[Specification](./specs/deduplicator.md)

`Deduplicator` coalesces concurrent asynchronous work by key.

`SingleFlightDeduplicator` shares one pending promise per key and forgets it
after the operation settles.

## RetryPolicy

[Specification](./specs/retry-policy.md)

`RetryPolicy` runs an asynchronous operation again after failure, according to
configurable retry rules.

`DefaultRetryPolicy` makes three attempts by default, with no delay. It
passes a one-based attempt number to the operation.

## Timeout

[Specification](./specs/timeout.md)

`Timeout` applies a deadline and supplies an `AbortSignal` to an asynchronous
operation.

`DefaultTimeout` rejects with `TimeoutError` when its deadline is reached and
propagates cancellation from an optional parent signal. The operation should
observe its signal. A timeout cannot stop arbitrary JavaScript work that
ignores cancellation.

```ts
import {
    DefaultRetryPolicy,
    DefaultTimeout,
    SingleFlightDeduplicator,
} from '@littlemissrobot/highfive';

const retry = new DefaultRetryPolicy();
const timeout = new DefaultTimeout();
const deduplicator = new SingleFlightDeduplicator();

const response = await deduplicator.run('current-user', () =>
    retry.run(() =>
        timeout.run(
            signal => fetch('/api/me', { signal }),
            5_000,
        ),
    ),
);
```

## Filesystem

[Specification](./specs/filesystem.md)

`Filesystem` reads, writes, deletes, checks, and moves binary files.

Highfive defines this contract and does not include a filesystem
implementation.

## HttpAuth

[Specification](./specs/http-auth.md)

`HttpAuth` transforms an HTTP request before it is sent.

`BearerHttpAuth(getToken)` obtains a token asynchronously and adds an
`Authorization: Bearer <token>` header. `getToken` receives the request's
`AbortSignal`.

## HttpClient

[Specification](./specs/http-client.md)

`HttpClient` sends `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.

`FetchHttpClient(auth?)` uses the global `fetch`. It resolves with the native
`Response` for successful responses and rejects with `HttpStatusError` for
non-2xx responses. `HttpStatusError` exposes the response `status`.

```ts
import {
    BearerHttpAuth,
    FetchHttpClient,
    HttpStatusError,
} from '@littlemissrobot/highfive';

const auth = new BearerHttpAuth(signal =>
    tokenStore.getAccessToken({ signal }),
);
const http = new FetchHttpClient(auth);

try {
    const response = await http.post('/api/tasks', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Ship it' }),
    });

    const task = await response.json();
}
catch (error) {
    if (error instanceof HttpStatusError && error.status === 401) {
        // Handle an expired or invalid session.
    }
    else {
        throw error;
    }
}
```

## IdGenerator

[Specification](./specs/id-generator.md)

`IdGenerator` generates identifiers that are unique for the application's
lifetime.

`CryptoIdGenerator` delegates to `globalThis.crypto.randomUUID()`.

## Logger

[Specification](./specs/logger.md)

`Logger` writes info, warning, and error messages.

`ConsoleLogger(clock)` writes timestamped messages to the corresponding
console method. `NothingLogger` implements `Logger` and discards every message.

## UrlBuilder

[Specification](./specs/url-builder.md)

`UrlBuilder<Routes>` builds a URL from a typed route table.

A route is either a string or a function that returns a string. `RouteArgs`
is the function's argument list, or an empty list for a string route.
`DefaultUrlBuilder(routes)` throws if the key is missing, the definition is
neither a string nor a function, or the function does not return a string.

```ts
import { DefaultUrlBuilder } from '@littlemissrobot/highfive';

const urls = new DefaultUrlBuilder({
    home: '/',
    profile: (id: string) => `/users/${id}`,
});

urls.make('home');
urls.make('profile', 'user-123');
```

## Notification

[Specification](./specs/notifier.md)

`Notification` describes a user-facing message, its level, and how long it
stays visible.

Omit `durationMs` to use an adapter's default duration. Set it to `null` to
keep a notification visible.

## Notifier

[Specification](./specs/notifier.md)

`Notifier` shows a notification and dismisses one by the identifier `notify`
returned.

Highfive defines this contract and does not include a notifier implementation.

## Serializer

[Specification](./specs/serializer.md)

`Serializer<Serialized>` converts a value to a serialized form and back.
`Serialized` defaults to `string`. `T` on `deserialize` is the static type of
the restored value. Check the result with a `Validator` when the caller needs
that value rejected or narrowed.

`JsonSerializer` serializes to a JSON string and implements `CodecRegistry`.
The constructor registers each codec it is given, in order. A plain object,
array, string, boolean, `null`, or finite number other than `-0` round-trips.
`undefined`, a bigint, a symbol, a function, `NaN`, an infinity, `-0`, a
circular reference, or an object that is not a plain object throws a
`TypeError` unless a registered codec supports that value.

```ts
import { DateCodec, JsonSerializer, MapCodec } from '@littlemissrobot/highfive';

const serializer = new JsonSerializer([
    new DateCodec(),
    new MapCodec(),
]);

const json = serializer.serialize({
    name: 'Ada',
    joined: new Date('2020-01-02T03:04:05.000Z'),
    scores: new Map([['a', 1]]),
});

const user = serializer.deserialize<{
    name: string;
    joined: Date;
    scores: Map<string, number>;
}>(json);
```

`serializerProvider` registers that serializer, including `DateCodec`,
`BigIntCodec`, `URLCodec`, `URLSearchParamsCodec`, `RegExpCodec`, `MapCodec`,
`SetCodec`, `Uint8ArrayCodec`, and `ArrayBufferCodec`, as the `serializer`
singleton.

## SerializationCodec

[Specification](./specs/serializer.md)

`SerializationCodec<T>` preserves a value that the serialized form cannot
represent on its own. `type` identifies the codec inside a serialized value.
`supports` reports whether the codec claims a value. `encode` returns the
representation to store. `decode` restores `T` from that representation.

Each built-in codec supports every value of its type. `encode` stores the
representation below. `decode` restores the value from that representation
and throws a `TypeError` for any other value. `DateCodec` also throws a
`TypeError` when encoding an invalid `Date`. `Uint8ArrayCodec` and
`ArrayBufferCodec` throw a `TypeError` when the buffer is detached.

| Codec | Representation |
| --- | --- |
| `DateCodec` | `toISOString()` |
| `BigIntCodec` | Canonical decimal string, such as `"0"`, `"1"`, or `"-42"` |
| `URLCodec` | `href` |
| `URLSearchParamsCodec` | `toString()` |
| `RegExpCodec` | `{ source, flags }` using the canonical `flags` string. `lastIndex` is omitted |
| `MapCodec` | Array of `[key, value]` pairs in insertion order |
| `SetCodec` | Array of values in insertion order |
| `Uint8ArrayCodec` | Array of integers from 0 through 255, covering the view |
| `ArrayBufferCodec` | Array of integers from 0 through 255 |

## CodecRegistry

[Specification](./specs/serializer.md)

`CodecRegistry` makes serialization codecs available to a serializer.
`register` adds a codec. An empty `type`, or a `type` that is already
registered, throws a `TypeError`. When several codecs support a value, the
first one registered serializes it. The JSON records that codec's `type`.

## Validator

[Specification](./specs/validator.md)

`Validator<T>` checks an unknown value and returns a typed result, or throws
when the value is rejected. `ValidationIssue` describes one reason a value was
rejected.

A rejected value throws an `Error` named `ValidationError`.
`ValidationError` is the included error for that shape. `issues` lists what
was rejected. An empty `path` applies to the whole value. A string addresses
an object property, and a number addresses an array index. A custom adapter
implements `Validator<T>` and throws `ValidationError` when it rejects a
value.

Included adapters:

- `StringValidator` accepts a string. `minLength` and `maxLength` are
  inclusive. Length counts UTF-16 code units. `nonEmpty` rejects `''`.
- `NumberValidator` accepts a finite number. `min` and `max` are inclusive.
- `IntegerValidator` accepts a safe integer. `min` and `max` are inclusive.
- `BooleanValidator` accepts `true` or `false`.
- `EmailValidator` accepts an address with one `@`, an ASCII local part, and
  a domain of at least two dot-separated ASCII labels. The final label is at
  least two characters.
- `URLValidator` accepts a string that the `URL` constructor can parse, and
  returns that string.
- `DateValidator` accepts a valid `Date`, or an ISO 8601 string, and returns
  a `Date`. `YYYY-MM-DD` is midnight UTC. A date-time uses `T` and a `Z` or
  `±HH:mm` offset.
- `ArrayValidator` validates each item with another validator. A rejected
  item keeps its message, prefixed with the index.
- `ObjectValidator` validates each declared field. A missing field is passed
  as `undefined`. Unknown fields are omitted. A rejected field keeps its
  message, prefixed with the field name.
- `OptionalValidator` accepts `undefined`, or a value accepted by another
  validator.
- `OneOfValidator` accepts a value that matches an allowed value with
  `Object.is`.

```ts
import {
    EmailValidator,
    ObjectValidator,
    OptionalValidator,
    StringValidator,
} from '@littlemissrobot/highfive';

const user = new ObjectValidator({
    name: new StringValidator({ nonEmpty: true }),
    email: new EmailValidator(),
    nickname: new OptionalValidator(new StringValidator()),
});

user.validate({
    name: 'Ada',
    email: 'ada@example.com',
});
```

## Transformer

[Specification](./specs/transformer.md)

`Transformer<In, Out>` maps a value of type `In` to a value of type `Out`.

`transform` returns the `Out` defined for that input. The result may be the
same reference, a copy, or a value with a different shape. The same input
produces a deeply equal result on a later call. A value that cannot be
represented throws, and the implementation chooses the exception. There is no
included adapter.

```ts
interface ApiUser {
    user_id: string;
}

interface User {
    id: string;
}

const toUser: Transformer<ApiUser, User> = {
    transform(api) {
        return { id: api.user_id };
    },
};
```

## Testing custom implementations

Reusable Vitest contract suites are exported from the package's
`/testsuite` entry point:

- `testAnalyticsContract`
- `testCacheContract`
- `testClockContract`
- `testConfigContract`
- `testContainerContract`
- `testTracerContract`
- `testErrorReporterContract`
- `testEventBusContract`
- `testDeduplicatorContract`
- `testRetryPolicyContract`
- `testTimeoutContract`
- `testFilesystemContract`
- `testHttpAuthContract`
- `testHttpClientContract`
- `testIdGeneratorContract`
- `testLoggerContract`
- `testUrlBuilderContract`
- `testNotifierContract`
- `testSerializerContract`
- `testSerializationCodecContract`
- `testCodecRegistryContract`
- `testValidatorContract`
- `testTransformerContract`

```ts
import { InMemoryCache } from '@littlemissrobot/highfive';
import { testCacheContract } from '@littlemissrobot/highfive/testsuite';

let now = 0;
const clock = {
    now: () => new Date(now),
};

testCacheContract(
    'InMemoryCache',
    () => new InMemoryCache(clock),
    (durationMs) => {
        now += durationMs;
    },
);
```

The test suites require Vitest 5 or newer. Keep adapter-specific tests for
behavior outside the shared contract.

## Optional: container and providers

`new DefaultContainer()` creates an empty typed container. Register only the
providers you need, in dependency order. Registering a provider before the
services it requires is a type error.

```ts
import {
    cacheProvider,
    clockProvider,
    DefaultContainer,
    loggerProvider,
} from '@littlemissrobot/highfive';

const container = new DefaultContainer()
    .register(clockProvider)
    .register(loggerProvider)
    .register(cacheProvider);

container.make('logger').info('Application started');
await container.make('cache').set('ready', 'yes');
```

Available providers are:

- `identifiersProvider`
- `clockProvider`
- `loggerProvider`
- `diagnosticsProvider`
- `executionProvider`
- `cacheProvider`
- `httpProvider`
- `analyticsProvider`
- `serializerProvider`

`http` reads `httpAuth` when `http` is first resolved. Replace the `httpAuth`
singleton before that resolution when requests need authentication.

`InMemoryEventBus` has no provider. Bind it, or any other application service,
on the container. Pass the extra bindings as the container's type argument so
`singleton` accepts them:

```ts
import type { EventBus } from '@littlemissrobot/highfive';
import {
    DefaultContainer,
    InMemoryEventBus,
} from '@littlemissrobot/highfive';

interface AppEvents {
    signedIn: { userId: string };
}

const container = new DefaultContainer<{
    events: () => EventBus<AppEvents>;
}>().singleton('events', () => new InMemoryEventBus<AppEvents>());
```

Use `bind` for a new instance on every resolution and `singleton` for one lazy
instance. The first resolution of a singleton supplies the arguments that
create it; later resolutions return that instance. Rebinding a service
invalidates its cached singleton.

## Optional: decorators

The decorators use TypeScript's standard decorator proposal and support
asynchronous methods. Each decorator receives the dependency it calls. Pass
that dependency when the class is defined.

- `@cached(cache, key, ttlMs?, options?)` caches a fulfilled result. Without
  `options.serializer`, the value is stored with `JSON.stringify` and read
  with `JSON.parse`. `key` may be a string or a function of the method
  arguments. A TTL must be a positive, finite number when the cache enforces
  that rule.
- `@retry(retryPolicy, options?)` applies the given `RetryPolicy`.
- `@timeout(timeout, durationMs)` applies the given `Timeout`.
- `@singleFlight(deduplicator, idGenerator, keyFor?)` coalesces concurrent
  calls to the same method and instance. `keyFor` can add the method arguments
  to that identity.
- `@trace(tracer, name?)` uses the given `Tracer`. The name defaults to the
  method name.
- `@log(logger, formatResult?, formatReceiver?)` logs fulfilled results through
  the given `Logger`.
- `@emit(eventBus, event)` emits fulfilled results to the supplied bus. The
  method's result type must match the event payload.
- `@validate(validator)` checks a fulfilled result with the given `Validator`.
  The method's result type must match the validator's result type.

```ts
import {
    cached,
    DefaultRetryPolicy,
    DefaultTimeout,
    FetchHttpClient,
    InMemoryCache,
    retry,
    SystemClock,
    timeout,
} from '@littlemissrobot/highfive';

const cache = new InMemoryCache(new SystemClock());
const retryPolicy = new DefaultRetryPolicy();
const deadlines = new DefaultTimeout();
const http = new FetchHttpClient();

class UserService {
    @cached(cache, (id: string) => `user:${id}`, 60_000)
    @retry(retryPolicy, { attempts: 3, delayMs: 250 })
    @timeout(deadlines, 5_000)
    async find(id: string) {
        const response = await http.get(`/api/users/${id}`);
        return response.json();
    }
}
```

Decorators are applied from the method outward. Here, `timeout` wraps the
method first, then `retry`, then `cached`. Ordering changes behavior.
`@timeout` enforces a deadline but cannot pass its generated signal into the
decorated method; use the `Timeout` contract directly when the operation must
receive that signal. `@cached` stores `JSON.stringify` output and returns
`JSON.parse` output unless `options.serializer` is set. That serializer's
`serialize` result is what gets stored, and `deserialize` is what a hit
returns.

The same wrappers exist for a function. Pass the dependencies first, then the
operation:

- `withCache(cache, key, ttlMs?, options?)`
- `withRetry(retryPolicy, options?)`
- `withTimeout(timeout, durationMs)`
- `withSingleFlight(deduplicator, idGenerator, keyFor?)` coalesces concurrent
  calls to that function. `keyFor` distinguishes arguments.
- `withTrace(tracer, name?)` uses the function's name when `name` is omitted.
- `withLog(logger, formatResult?, name?)` logs a fulfilled result. `name`
  defaults to the function's name.
- `withEmit(eventBus, event)`
- `withValidate(validator)`
- `withTransform(transformer)`

Using the cache, retry policy, timeout, and HTTP client from the example above:

```ts
import {
    withCache,
    withRetry,
    withTimeout,
} from '@littlemissrobot/highfive';

const find = withCache(cache, (id: string) => `user:${id}`, 60_000)(
    withRetry(retryPolicy, { attempts: 3, delayMs: 250 })(
        withTimeout(deadlines, 5_000)(async (id: string) => {
            const response = await http.get(`/api/users/${id}`);
            return response.json();
        }),
    ),
);
```

`createFacades(container)` returns one function per container binding. Calling
`facades.clock()` resolves that binding through `container.make`. The returned
object is not a promise, so awaiting it does not resolve the container.

`createFlow(operation)` returns that async function with a `use` method.
`use` takes a wrapper such as `withRetry`, `withValidate`, or `withTransform`
and returns the next flow. Wrappers apply from the inside out: the first
`use` is the innermost layer. The flow itself is the function you call.

```ts
import {
    createFlow,
    withRetry,
    withTransform,
    withValidate,
} from '@littlemissrobot/highfive';

const getUser = createFlow(async (id: string) => {
    const response = await http.get(`/api/users/${id}`);

    return response.json();
})
    .use(withRetry(retryPolicy, { attempts: 3, delayMs: 250 }))
    .use(withValidate(userValidator))
    .use(withTransform(toUser));

const user = await getUser('ada');
```

`installBrowserErrorReporting(reporter)` listens for `error` and
`unhandledrejection` on `window` and sends both to an `ErrorReporter`. An
`error` event is reported with `source: 'uncaught-exception'`. An
`unhandledrejection` event is reported with `source: 'unhandled-rejection'`.
The returned function removes those listeners. This helper needs a browser
`window`.

```ts
import { installBrowserErrorReporting } from '@littlemissrobot/highfive';

const uninstall = installBrowserErrorReporting(reporter);

uninstall();
```

## Runtime requirements

- Node.js 18 or newer, or a modern browser, for the web APIs used by the
  included implementations.
- TypeScript 5 or newer when using decorators.
- `fetch`, `Headers`, `Response`, and `AbortController` for `FetchHttpClient`
  and `BearerHttpAuth`.
- `crypto.randomUUID` for `CryptoIdGenerator`.
- `performance.now` for `LogTracer`.
- `window.localStorage` for `LocalStorageCache`.

Projects that depend only on the contracts do not need these implementation
APIs.

## Development

```sh
git clone https://github.com/Little-Miss-Robot/highfive.git
cd highfive
npm install
npm test
npm run build
```

## License

[MIT](./LICENSE.md) © Little Miss Robot
