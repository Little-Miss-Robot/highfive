# Highfive

## A contract-first TypeScript library for building applications with interchangeable services and shared conventions.

[![npm version](https://img.shields.io/npm/v/%40littlemissrobot%2Fhighfive)](https://www.npmjs.com/package/@littlemissrobot/highfive)
[![CI](https://github.com/Little-Miss-Robot/highfive/actions/workflows/main.yml/badge.svg)](https://github.com/Little-Miss-Robot/highfive/actions/workflows/main.yml)
[![license](https://img.shields.io/npm/l/%40littlemissrobot%2Fhighfive)](./package.json)

## Installation

```sh
npm install @littlemissrobot/highfive
```

The package ships ESM and CommonJS builds with TypeScript declarations.

## Contracts

Highfive is primarily a collection of small TypeScript contracts for
application infrastructure. Application code can depend on these interfaces
instead of a particular framework, vendor, or runtime implementation.

### The package provides:

- **`Analytics`** — records a named tracking event with optional data.
- **`Cache`** — asynchronously reads, writes, and deletes string values, with
  optional time-to-live support.
- **`Clock`** — returns the current `Date`, making time replaceable in tests.
- **`Config<Values>`** — reads a typed configuration value by key.
- **`Container`** and **`ServiceProvider`** — describe typed dependency
  resolution and composable service registration.
- **`Tracer`** — observes an asynchronous operation while preserving its result
  or error.
- **`EventBus<E>`** — publishes typed events and subscribes typed listeners.
- **`Deduplicator`** — coalesces concurrent asynchronous work by key.
- **`RetryPolicy`** — runs an asynchronous operation again after failure,
  according to configurable retry rules.
- **`Timeout`** — applies a deadline and supplies an `AbortSignal` to an
  asynchronous operation.
- **`Filesystem`** — reads, writes, deletes, checks, and moves binary files.
- **`HttpAuth`** — transforms an HTTP request before it is sent.
- **`HttpClient`** — sends `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.
- **`IdGenerator`** — generates identifiers that are unique for the
  application's lifetime.
- **`Logger`** — writes info, warning, and error messages.
- **`UrlBuilder<Routes>`** — builds a URL from a typed route table.
- **`Notification`** and **`Notifier`** — describe user-facing notifications
  and their lifecycle.
- **`Serializer<Value, Serialized>`** — converts a value to a serialized form
  and back.

## Contract reference

Normative requirements for each contract are in [`specs/`](./specs). Those documents use the key words defined by [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

- [Analytics](./specs/analytics.md)
- [Cache](./specs/cache.md)
- [Clock](./specs/clock.md)
- [Config](./specs/config.md)
- [Container and ServiceProvider](./specs/container.md)
- [Tracer](./specs/tracer.md)
- [EventBus](./specs/event-bus.md)
- [Deduplicator](./specs/deduplicator.md)
- [RetryPolicy](./specs/retry-policy.md)
- [Timeout](./specs/timeout.md)
- [Filesystem](./specs/filesystem.md)
- [HttpAuth](./specs/http-auth.md)
- [HttpClient](./specs/http-client.md)
- [IdGenerator](./specs/id-generator.md)
- [Logger](./specs/logger.md)
- [UrlBuilder](./specs/url-builder.md)
- [Notification and Notifier](./specs/notifier.md)
- [Serializer](./specs/serializer.md)

### Analytics

[Specification](./specs/analytics.md)

```ts
type AnalyticsValue = string | number | boolean | null;
type AnalyticsPayload = Record<string, AnalyticsValue>;

interface Analytics {
    track(event: string, properties?: AnalyticsPayload): void;
}
```

`LoggerAnalytics(logger)` is the included adapter. It writes events through a
`Logger`.

### Cache

[Specification](./specs/cache.md)

```ts
interface Cache {
    get(key: string): Promise<string | undefined>;
    set(
        key: string,
        value: string,
        options?: { ttlMs?: number },
    ): Promise<void>;
    delete(key: string): Promise<void>;
}
```

Included adapters:

- `MemoryCache(clock)` stores values for the lifetime of the instance.
- `LocalStorageCache(namespace, clock)` stores values in the browser's
  `window.localStorage`, under keys prefixed with `highfive:<namespace>:`.

Both adapters expire entries lazily when they are read. A TTL must be a
positive, finite number.

```ts
import {
    MemoryCache,
    SystemClock,
} from '@littlemissrobot/highfive';

const cache = new MemoryCache(new SystemClock());
await cache.set('session', 'active', { ttlMs: 60_000 });
const session = await cache.get('session');
```

### Clock

[Specification](./specs/clock.md)

```ts
interface Clock {
    now(): Date;
}
```

`SystemClock` reads the system time. `AdvanceableClock` is a deterministic fake
whose time starts at the Unix epoch and can be moved forward with
`advance(durationMs)`.

### Config

[Specification](./specs/config.md)

```ts
interface Config<Values extends object> {
    get<Key extends keyof Values>(key: Key): Values[Key];
}
```

Highfive defines this contract but does not include a config
implementation.

### Container and service providers

[Specification](./specs/container.md)

`Container<B>` binds factories, binds lazy singletons, registers providers, and
resolves services with `make`. `ServiceProvider<Provides, Requires>` describes
the services a provider adds and the services it needs.

`DefaultContainer` is the included implementation. Create one and register
providers in dependency order. Container usage is optional; all other
implementations can be constructed directly.

### Tracing

[Specification](./specs/tracer.md)

```ts
interface Tracer {
    trace<T>(name: string, operation: () => Promise<T>): Promise<T>;
}
```

`LogTracer(logger)` measures an operation with `performance.now()` and logs its
duration and success or failure through a `Logger`.

### Events

[Specification](./specs/event-bus.md)

```ts
interface EventBus<E extends object> {
    on<K extends keyof E>(
        event: K,
        listener: (payload: E[K]) => void,
    ): () => void;

    emit<K extends keyof E>(event: K, payload: E[K]): void;
}
```

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

### Execution

Specifications: [Deduplicator](./specs/deduplicator.md), [RetryPolicy](./specs/retry-policy.md), [Timeout](./specs/timeout.md)

```ts
interface Deduplicator {
    run<T>(key: string, operation: () => Promise<T>): Promise<T>;
}

interface RetryPolicy {
    run<T>(
        operation: (attempt: number) => Promise<T>,
        options?: {
            attempts?: number;
            delayMs?: number;
            shouldRetry?: (
                error: unknown,
                failedAttempt: number,
            ) => boolean;
        },
    ): Promise<T>;
}

interface Timeout {
    run<T>(
        operation: (signal: AbortSignal) => Promise<T>,
        durationMs: number,
        signal?: AbortSignal,
    ): Promise<T>;
}
```

Included implementations:

- `SingleFlightDeduplicator` shares one pending promise per key and forgets it
  after the operation settles.
- `DefaultRetryPolicy` makes three attempts by default, with no delay. It
  passes a one-based attempt number to the operation.
- `DefaultTimeout` rejects with `TimeoutError` when its deadline is reached and
  propagates cancellation from an optional parent signal.

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

The operation passed to `Timeout` should observe its signal. A timeout cannot
stop arbitrary JavaScript work that ignores cancellation.

### Filesystem

[Specification](./specs/filesystem.md)

```ts
interface Filesystem {
    read(path: string): Promise<Uint8Array>;
    write(path: string, contents: Uint8Array): Promise<void>;
    delete(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    move(from: string, to: string): Promise<void>;
}
```

Highfive defines this contract but does not include a filesystem
implementation.

### HTTP

Specifications: [HttpAuth](./specs/http-auth.md), [HttpClient](./specs/http-client.md)

```ts
interface HttpAuth {
    authorize(request: HttpAuthRequest): Promise<HttpAuthRequest>;
}

interface HttpClient {
    get(url: string, options?: HttpOptions): Promise<Response>;
    post(url: string, options?: HttpBodyOptions): Promise<Response>;
    put(url: string, options?: HttpBodyOptions): Promise<Response>;
    patch(url: string, options?: HttpBodyOptions): Promise<Response>;
    delete(url: string, options?: HttpBodyOptions): Promise<Response>;
}
```

`FetchHttpClient(auth?)` uses the global `fetch`. It resolves with the native
`Response` for successful responses and rejects with `HttpStatusError` for
non-2xx responses. `HttpStatusError` exposes the response `status`.

`BearerHttpAuth(getToken)` obtains a token asynchronously and adds an
`Authorization: Bearer <token>` header. `getToken` receives the request's
`AbortSignal`.

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

### Identifiers

[Specification](./specs/id-generator.md)

```ts
interface IdGenerator {
    generate(): string;
}
```

`CryptoIdGenerator` delegates to `globalThis.crypto.randomUUID()`.

### Logging

[Specification](./specs/logger.md)

```ts
enum LogLevel {
    ERROR,
    WARNING,
    INFO,
}

interface Logger {
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
    log(level: LogLevel, message: string): void;
}
```

`ConsoleLogger(clock)` writes timestamped messages to the corresponding
console method. `NothingLogger` implements `Logger` and discards every message.

### URLs

[Specification](./specs/url-builder.md)

```ts
interface UrlBuilder<Routes extends object> {
    make<Key extends keyof Routes & string>(
        key: Key,
        ...args: RouteArgs<Routes[Key]>
    ): string;
}
```

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

### Notifications

[Specification](./specs/notifier.md)

```ts
type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    message: string;
    level: NotificationLevel;
    durationMs?: number | null;
}

interface Notifier {
    notify(notification: Notification): string;
    dismiss(id: string): void;
}
```

Omit `durationMs` to use an adapter's default duration. Set it to `null` to
keep a notification visible. Highfive defines these contracts but does not
include a notifier implementation.

### Serializer

[Specification](./specs/serializer.md)

```ts
interface Serializer<Value, Serialized = string> {
    serialize(value: Value): Serialized;
    deserialize(serialized: Serialized): Value;
}
```

`JsonSerializer(decode)` serializes with `JSON.stringify` and deserializes with
`JSON.parse`. `decode` receives the parsed value and must return `Value` or
throw. Serialization throws a `TypeError` when `JSON.stringify` returns
`undefined`.

```ts
import { JsonSerializer } from '@littlemissrobot/highfive';

interface User {
    name: string;
}

const users = new JsonSerializer<User>((value) => {
    if (
        typeof value !== 'object'
        || value === null
        || !('name' in value)
        || typeof value.name !== 'string'
    ) {
        throw new TypeError('Expected a user');
    }

    return { name: value.name };
});

const json = users.serialize({ name: 'Ada' });
const user = users.deserialize(json);
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

```ts
import { MemoryCache } from '@littlemissrobot/highfive';
import { testCacheContract } from '@littlemissrobot/highfive/testsuite';

let now = 0;
const clock = {
    now: () => new Date(now),
};

testCacheContract(
    'MemoryCache',
    () => new MemoryCache(clock),
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

- `@cached(cache, key, ttlMs?)` caches a fulfilled result as JSON. `key` may
  be a string or a function of the method arguments. A TTL must be a positive,
  finite number when the cache enforces that rule.
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

```ts
import {
    cached,
    DefaultRetryPolicy,
    DefaultTimeout,
    FetchHttpClient,
    MemoryCache,
    retry,
    SystemClock,
    timeout,
} from '@littlemissrobot/highfive';

const cache = new MemoryCache(new SystemClock());
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
`JSON.parse` output as the method's result type.

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

[MIT](./package.json) © Little Miss Robot
