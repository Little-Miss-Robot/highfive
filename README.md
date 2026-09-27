# Interop Core

[![npm version](https://img.shields.io/npm/v/%40littlemissrobot%2Finterop-core)](https://www.npmjs.com/package/@littlemissrobot/interop-core)
[![CI](https://github.com/Little-Miss-Robot/interop-core/actions/workflows/main.yml/badge.svg)](https://github.com/Little-Miss-Robot/interop-core/actions/workflows/main.yml)
[![license](https://img.shields.io/npm/l/%40littlemissrobot%2Finterop-core)](./package.json)

## Contracts

Interop Core is primarily a collection of small TypeScript contracts for
application infrastructure. Application code can depend on these interfaces
instead of a particular framework, vendor, or runtime implementation.

The package provides:

- **`Analytics`** — records a named event with optional scalar properties.
- **`Cache`** — asynchronously reads, writes, and deletes string values, with
  optional time-to-live support.
- **`Clock`** — returns the current `Date`, making time replaceable in tests.
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
- **`HttpAuth`** — transforms an HTTP request before it is sent.
- **`HttpClient`** — sends `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.
- **`IdGenerator`** — generates identifiers that are unique for the
  application's lifetime.
- **`Logger`** — writes info, warning, and error messages.
- **`Notification`** and **`Notifier`** — describe user-facing notifications
  and their lifecycle.

Use only the contracts your application needs:

```ts
import type {
    Clock,
    IdGenerator,
    Logger,
} from '@littlemissrobot/interop-core';

export class JobService {
    constructor(
        private readonly clock: Clock,
        private readonly ids: IdGenerator,
        private readonly logger: Logger,
    ) {}

    start() {
        const job = {
            id: this.ids.generate(),
            startedAt: this.clock.now(),
        };

        this.logger.info(`Started job ${job.id}`);
        return job;
    }
}
```

Interop Core also includes implementations for most contracts. Decorators,
facades, and the dependency-injection container are optional conveniences, not
requirements.

## Installation

```sh
npm install @littlemissrobot/interop-core
```

The package ships ESM and CommonJS builds with TypeScript declarations.

## Contract reference

### Analytics

```ts
type AnalyticsValue = string | number | boolean | null;
type AnalyticsPayload = Record<string, AnalyticsValue>;

interface Analytics {
    track(event: string, properties?: AnalyticsPayload): void;
}
```

`LoggerAnalytics` is the included adapter. It writes events through a `Logger`.

### Cache

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
- `LocalStorageCache(namespace, clock)` stores namespaced values in the
  browser's `window.localStorage`.

Both adapters expire entries lazily when they are read. A TTL must be a
positive, finite number.

```ts
import {
    MemoryCache,
    SystemClock,
} from '@littlemissrobot/interop-core';

const cache = new MemoryCache(new SystemClock());
await cache.set('session', 'active', { ttlMs: 60_000 });
const session = await cache.get('session');
```

### Clock

```ts
interface Clock {
    now(): Date;
}
```

`SystemClock` reads the system time. `AdvanceableClock` is a deterministic fake
whose time starts at the Unix epoch and can be moved forward with
`advance(durationMs)`.

### Container and service providers

`Container<B>` binds factories, binds lazy singletons, registers providers, and
resolves services with `make`. `ServiceProvider<Provides, Requires>` describes
the services a provider adds and the services it needs.

`InteropContainer` is the included implementation. Container usage is
optional; all other implementations can be constructed directly.

### Tracing

```ts
interface Tracer {
    trace<T>(name: string, operation: () => Promise<T>): Promise<T>;
}
```

`LogTracer` measures an operation with `performance.now()` and logs its
duration and success or failure through a `Logger`.

### Events

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
import { InMemoryEventBus } from '@littlemissrobot/interop-core';

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
} from '@littlemissrobot/interop-core';

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

### HTTP

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

`FetchHttpClient` uses the global `fetch`. It resolves with the native
`Response` for successful responses and rejects with `HttpStatusError` for
non-2xx responses.

`BearerHttpAuth` obtains a token asynchronously and adds an
`Authorization: Bearer <token>` header.

```ts
import {
    BearerHttpAuth,
    FetchHttpClient,
    HttpStatusError,
} from '@littlemissrobot/interop-core';

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

```ts
interface IdGenerator {
    generate(): string;
}
```

`CryptoIdGenerator` delegates to `globalThis.crypto.randomUUID()`.

### Logging

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
console method.

### Notifications

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
keep a notification visible. Interop Core defines these contracts but does not
include a notifier implementation.

## Testing custom implementations

Reusable Vitest contract suites are exported from the package's
`/testsuite` entry point:

- `testCacheContract`
- `testIdGeneratorContract`
- `testRetryPolicyContract`
- `testTimeoutContract`
- `testDeduplicatorContract`

```ts
import { MemoryCache } from '@littlemissrobot/interop-core';
import { testCacheContract } from '@littlemissrobot/interop-core/testsuite';

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

The test suites require Vitest 2 or newer. Keep adapter-specific tests for
behavior outside the shared contract.

## Optional: container and providers

`createContainer()` creates an empty typed container. Register only the
providers you need, in dependency order:

```ts
import {
    cacheProvider,
    clockProvider,
    createContainer,
    loggerProvider,
} from '@littlemissrobot/interop-core';

const container = createContainer()
    .register(clockProvider)
    .register(loggerProvider)
    .register(cacheProvider);

container.make('logger').info('Application started');
await container.make('cache').set('ready', 'yes');
```

Available providers are:

- `identifiersProvider` → `CryptoIdGenerator`
- `clockProvider` → `SystemClock`
- `loggerProvider` → `ConsoleLogger` (requires `clockProvider`)
- `diagnosticsProvider` → `LogTracer` (requires `loggerProvider`)
- `executionProvider` → `DefaultRetryPolicy`, `DefaultTimeout`, and
  `SingleFlightDeduplicator`
- `cacheProvider` → `MemoryCache` (requires `clockProvider`)
- `httpProvider` → `FetchHttpClient` and an `httpAuth` binding that initially
  resolves to `undefined`
- `analyticsProvider` → `LoggerAnalytics` (requires `loggerProvider`)
- `eventsProvider<E>()` → `InMemoryEventBus<E>`

Use `bind` for a new instance on every resolution and `singleton` for one lazy
instance. Rebinding a service invalidates its cached singleton.

## Optional: facades

Facades resolve services from an active container. Configure one once with
`useContainer` before calling a facade:

```ts
import {
    clock,
    clockProvider,
    createContainer,
    id,
    identifiersProvider,
    useContainer,
} from '@littlemissrobot/interop-core';

useContainer(
    createContainer()
        .register(identifiersProvider)
        .register(clockProvider),
);

const createdAt = clock().now();
const identifier = id().generate();
```

The exported facades are `analytics()`, `cache()`, `clock()`, `http()`, `id()`,
and `logger()`. Calling one before `useContainer(...)` throws
`Interop has not been configured`.

## Optional: decorators

The decorators use TypeScript's standard decorator proposal and support
asynchronous methods. Except for `emit`, they resolve their dependencies from
the active container.

- `@cached(key, ttlMs?)` caches a fulfilled result as JSON.
- `@retry(options?)` applies the active `RetryPolicy`.
- `@timeout(durationMs)` applies the active `Timeout`.
- `@singleFlight(keyFor?)` coalesces concurrent calls to the same method and
  instance.
- `@trace(name?)` uses the active `Tracer`.
- `@log(formatResult?, formatReceiver?)` logs fulfilled results.
- `@emit(eventBus, event)` emits fulfilled results to the supplied bus.

```ts
import {
    cached,
    cacheProvider,
    clockProvider,
    createContainer,
    executionProvider,
    http,
    httpProvider,
    retry,
    timeout,
    useContainer,
} from '@littlemissrobot/interop-core';

useContainer(
    createContainer()
        .register(clockProvider)
        .register(executionProvider)
        .register(cacheProvider)
        .register(httpProvider),
);

class UserService {
    @cached((id: string) => `user:${id}`, 60_000)
    @retry({ attempts: 3, delayMs: 250 })
    @timeout(5_000)
    async find(id: string) {
        const response = await http().get(`/api/users/${id}`);
        return response.json();
    }
}
```

Decorators are applied from the method outward. Here, `timeout` wraps the
method first, then `retry`, then `cached`. Ordering changes behavior.
`@timeout` enforces a deadline but cannot pass its generated signal into the
decorated method; use the `Timeout` contract directly when the operation must
receive that signal.

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
git clone https://github.com/Little-Miss-Robot/interop-core.git
cd interop-core
npm install
npm test
npm run build
```

## License

[ISC](./package.json) © Rein Van Oyen
