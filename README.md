# Interop Core

[![npm version](https://img.shields.io/npm/v/%40littlemissrobot%2Finterop-core)](https://www.npmjs.com/package/@littlemissrobot/interop-core)
[![CI](https://github.com/Little-Miss-Robot/interop-core/actions/workflows/main.yml/badge.svg)](https://github.com/Little-Miss-Robot/interop-core/actions/workflows/main.yml)
[![license](https://img.shields.io/npm/l/%40littlemissrobot%2Finterop-core)](./package.json)

A lightweight TypeScript toolkit for composable application infrastructure and
cross-cutting concerns.

Interop Core provides small contracts, practical default implementations, a
type-safe service container, and decorators for behavior such as caching,
retries, tracing, timeouts, event emission, and request deduplication. Use the
preconfigured services for a quick start, or replace individual bindings
without changing application code.

## Features

- Type-safe dependency injection with singleton and transient bindings
- Fetch-based HTTP client with pluggable authentication
- In-memory and browser `localStorage` caches with TTL support
- Typed in-memory events
- Retry, timeout, and single-flight execution policies
- Clock and ID abstractions for deterministic application code
- Console logging, tracing, and logger-backed analytics
- Standards-based TypeScript method decorators
- Reusable contract test suites for custom implementations
- ESM and CommonJS builds with TypeScript declarations

## Requirements

- Node.js 18 or newer, or a modern browser
- TypeScript 5 or newer when using decorators
- Runtime support for the web APIs used by the selected implementations:
  `fetch`, `Headers`, `Response`, `AbortController`, `crypto.randomUUID`, and
  `performance`

`LocalStorageCache` additionally requires `window.localStorage`.

## Installation

```sh
npm install @littlemissrobot/interop-core
```

## Quick start

The package includes a preconfigured container. Its facades resolve the current
binding each time they are called, so application code remains unchanged when a
service is replaced.

```ts
import {
    cache,
    httpService,
    log,
    retry,
    singleFlight,
    timeout,
    trace,
} from '@littlemissrobot/interop-core';

class UserService {
    @trace('Load user')
    @log(user => JSON.stringify(user))
    @cache((id: string) => `user:${id}`, 60_000)
    @singleFlight((id: string) => id)
    @retry({ attempts: 3, delayMs: 250 })
    @timeout(5_000)
    async find(id: string) {
        const response = await httpService().get(`/api/users/${id}`);
        return response.json();
    }
}
```

All Interop decorators target asynchronous methods. Decorators are applied from
the method outward: in the example above, `timeout` wraps the method first,
followed by `retry`, `singleFlight`, `cache`, `log`, and finally `trace`.
Ordering therefore changes behavior. For example, placing `@retry` outside
`@timeout` gives every attempt its own timeout; reversing them gives the entire
retry operation one timeout.

## Services and facades

The default container exposes the following service facades:

- `analyticsService()` returns the configured `Analytics`.
- `cacheService()` returns the configured `Cache`.
- `clockService()` returns the configured `Clock`.
- `eventsService()` returns the configured `EventBus`.
- `httpService()` returns the configured `HttpClient`.
- `idService()` returns the configured `IdGenerator`.
- `loggerService()` returns the configured `Logger`.

Execution services and diagnostics are available through the container as
`deduplicator`, `retryPolicy`, `timeout`, and `tracer`.

Facades do not create a second service instance. They resolve from the shared
container and honor any replacement binding.

## Decorators

Interop uses the standard decorators supported by TypeScript 5. Decorated
methods must return a `Promise`.

### `@cache(key, ttlMs?)`

Caches the fulfilled result as JSON. The key may be a string or a function of
the method arguments.

```ts
class Catalog {
    @cache((sku: string) => `product:${sku}`, 5 * 60_000)
    async product(sku: string) {
        return fetch(`/api/products/${sku}`).then(response => response.json());
    }
}
```

A cached value of `undefined` is treated as a miss. Results that
`JSON.stringify` cannot serialize are returned but are not cached. Serialization
and parsing errors are propagated.

### `@retry(options?)`

Retries a rejected operation.

```ts
class Importer {
    @retry({
        attempts: 4,
        delayMs: 500,
        shouldRetry: error => error instanceof TypeError,
    })
    async run() {
        // ...
    }
}
```

Options:

- `attempts` — total number of attempts, including the first. Defaults to `3`.
- `delayMs` — fixed delay between attempts. Defaults to `0`.
- `shouldRetry(error, failedAttempt)` — returns whether another attempt should
  be made. Defaults to always returning `true`.

### `@timeout(durationMs)`

Rejects with `TimeoutError` if the operation does not settle in time.

```ts
class Reports {
    @timeout(10_000)
    async generate() {
        // ...
    }
}
```

The decorator enforces the deadline but cannot force arbitrary work to stop.
Use the `Timeout` service directly when the operation needs the generated
`AbortSignal`.

### `@singleFlight(keyFor?)`

Coalesces concurrent calls with the same key into one in-flight promise. Calls
are scoped to the decorated method and class instance.

```ts
class SessionStore {
    @singleFlight((userId: string) => userId)
    async refresh(userId: string) {
        // Concurrent refreshes for this user share one operation.
    }
}
```

Completed and failed operations are removed, so later calls may run again.

### `@trace(name?)`

Measures an operation with the configured tracer and preserves its result or
error. If no name is supplied, the method name is used.

```ts
class Checkout {
    @trace('Submit checkout')
    async submit() {
        // ...
    }
}
```

### `@log(formatResult?, formatReceiver?)`

Logs the fulfilled result through the configured logger. By default, it uses
`String(result)` and identifies the receiver by its class name.

```ts
class Calculator {
    @log(value => JSON.stringify(value))
    async totals() {
        return { subtotal: 10, tax: 2 };
    }
}
```

Rejected calls are not logged by this decorator. Use `@trace` when both success
and failure should be recorded.

### `@emit(bus, event)`

Emits a fulfilled method result as a typed event.

```ts
import {
    emit,
    InMemoryEventBus,
} from '@littlemissrobot/interop-core';

interface AccountEvents {
    created: { id: string; email: string };
}

const accountEvents = new InMemoryEventBus<AccountEvents>();
const unsubscribe = accountEvents.on('created', account => {
    console.info('Created account', account.id);
});

class Accounts {
    @emit(accountEvents, 'created')
    async create(email: string) {
        return { id: crypto.randomUUID(), email };
    }
}

unsubscribe();
```

No event is emitted when the method rejects. Event listeners run synchronously
in registration order.

## Core APIs

### Cache

The `Cache` contract stores strings:

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

Included implementations:

- `MemoryCache(clock)` stores entries for the lifetime of the instance.
- `LocalStorageCache(namespace, clock)` persists namespaced entries in browser
  local storage under `interop:<namespace>:<key>`.

A TTL must be a positive, finite number. Expiration is checked lazily when an
entry is read.

### HTTP

`FetchHttpClient` provides `get`, `post`, `put`, `patch`, and `delete` methods.
Each resolves with the native `Response`. Non-2xx responses reject with
`HttpStatusError`; inspect its `status` property for the HTTP status code.

```ts
import {
    BearerHttpAuth,
    FetchHttpClient,
    HttpStatusError,
} from '@littlemissrobot/interop-core';

const auth = new BearerHttpAuth(async signal => {
    return tokenStore.getAccessToken({ signal });
});

const client = new FetchHttpClient(auth);

try {
    const response = await client.post('/api/tasks', {
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

`HttpAuth` receives the method, URL, and options before each request and may
return modified values. `BearerHttpAuth` obtains a token asynchronously and
sets the `Authorization: Bearer <token>` header.

### Events

`EventBus<E>` maps event names to payload types:

```ts
interface AppEvents {
    signedIn: { userId: string };
    signedOut: undefined;
}

const bus = new InMemoryEventBus<AppEvents>();

const off = bus.on('signedIn', ({ userId }) => {
    console.info(userId);
});

bus.emit('signedIn', { userId: 'user-123' });
off();
```

`on` returns an unsubscribe function. Listener exceptions are not swallowed and
will interrupt the current `emit` call.

### Execution policies

Each policy can be used without decorators.

```ts
import {
    DefaultRetryPolicy,
    DefaultTimeout,
    SingleFlightDeduplicator,
} from '@littlemissrobot/interop-core';

const retryPolicy = new DefaultRetryPolicy();
const timeout = new DefaultTimeout();
const deduplicator = new SingleFlightDeduplicator();

const result = await deduplicator.run('profile:user-123', () =>
    retryPolicy.run(
        () => timeout.run(
            signal => fetch('/api/profile', { signal }),
            5_000,
        ),
        { attempts: 3, delayMs: 200 },
    ),
);
```

- `DefaultRetryPolicy` uses a fixed delay and rethrows the last error.
- `DefaultTimeout` supports parent cancellation and rejects with
  `TimeoutError` when its own deadline expires.
- `SingleFlightDeduplicator` shares one pending promise per key.

The operation passed to `DefaultTimeout` should observe its `AbortSignal`.
Timing out rejects the caller promptly, but JavaScript work that ignores
cancellation may continue in the background.

### Clock and identifiers

`SystemClock.now()` returns the current `Date`.
`CryptoIdGenerator.generate()` returns a UUID from
`globalThis.crypto.randomUUID()`.

Depend on the `Clock` and `IdGenerator` contracts in application code when
time and identity need to be controllable in tests.

### Logging, tracing, and analytics

- `ConsoleLogger` writes timestamped `INFO`, `WARNING`, and `ERROR` messages.
- `LogTracer` records operation duration and success or failure.
- `LoggerAnalytics` writes event names and JSON properties through a `Logger`.

Analytics properties may be strings, numbers, booleans, or `null`.

## Container and providers

`InteropContainer` tracks the services available at compile time. Registering a
provider extends that type, while provider requirements ensure dependencies are
registered first.

```ts
import {
    type Dependencies,
    clockProvider,
    InteropContainer,
    loggerProvider,
} from '@littlemissrobot/interop-core';

const app = new InteropContainer()
    .register(clockProvider)
    .register(loggerProvider);

app.make('logger').info('Application started');
```

### Bindings

Use `bind` for a new instance on every resolution and `singleton` for one
lazy instance:

```ts
interface GreeterDependencies extends Dependencies {
    greeter: (prefix: string) => {
        greet(name: string): string;
    };
}

const app = new InteropContainer<GreeterDependencies>()
    .bind('greeter', prefix => ({
        greet: name => `${prefix}, ${name}!`,
    }));

app.make('greeter', 'Hello').greet('Ada');
```

Rebinding a service invalidates its cached singleton. Singleton factory
arguments are used only on the first resolution.

### Custom providers

A provider declares what it supplies and what it requires:

```ts
import type {
    ClockDependencies,
    Dependencies,
    ServiceProvider,
} from '@littlemissrobot/interop-core';

interface Scheduler {
    startedAt(): Date;
}

interface SchedulerDependencies extends Dependencies {
    scheduler: () => Scheduler;
}

const schedulerProvider: ServiceProvider<
    SchedulerDependencies,
    ClockDependencies
> = {
    register(context) {
        context.singleton('scheduler', () => ({
            startedAt: () => context.make('clock').now(),
        }));
    },
};

const app = new InteropContainer()
    .register(clockProvider)
    .register(schedulerProvider);
```

Registering `schedulerProvider` before `clockProvider` produces a TypeScript
error.

### Replacing a default service

Replace a binding before application code resolves it:

```ts
import {
    container,
    type Logger,
} from '@littlemissrobot/interop-core';

const logger: Logger = {
    error: message => telemetry.capture('error', message),
    warning: message => telemetry.capture('warning', message),
    info: message => telemetry.capture('info', message),
    log: (_level, message) => telemetry.capture('log', message),
};

container.singleton('logger', () => logger);
```

Services that were already constructed may retain their previous dependencies.
Configure the shared container during application startup, before resolving
facades or invoking decorated methods.

## Default providers

The preconfigured container registers:

- `identifiersProvider` → `CryptoIdGenerator`
- `clockProvider` → `SystemClock`
- `loggerProvider` → `ConsoleLogger`
- `diagnosticsProvider` → `LogTracer`
- `executionProvider` → `DefaultRetryPolicy`, `DefaultTimeout`, and
  `SingleFlightDeduplicator`
- `cacheProvider` → `MemoryCache`
- `httpProvider` → `FetchHttpClient` and `HttpAuth`
- `analyticsProvider` → `LoggerAnalytics`
- `eventsProvider<E>()` → `InMemoryEventBus<E>`

Provider order matters when one provider requires services from another.

## Error handling

Interop preserves application errors unless a component defines a more
specific failure:

- `HttpStatusError` is thrown for a non-successful HTTP response.
- `TimeoutError` is thrown when `DefaultTimeout` reaches its deadline.
- `RangeError` is thrown for invalid retry counts, delays, timeouts, or cache
  TTLs.
- Parent `AbortSignal` reasons are propagated by `DefaultTimeout`.

Use `instanceof` to narrow Interop errors:

```ts
try {
    await operation();
}
catch (error) {
    if (error instanceof TimeoutError) {
        console.error(`Timed out after ${error.durationMs} ms`);
    }
}
```

## Testing custom implementations

Interop exports reusable contract suites for compatible adapters:

- `testCacheContract`
- `testIdGeneratorContract`
- `testRetryPolicyContract`
- `testTimeoutContract`
- `testDeduplicatorContract`

Call a suite from your Vitest test file with a factory for the implementation:

```ts
import {
    MemoryCache,
    testCacheContract,
} from '@littlemissrobot/interop-core';

let now = 0;
const clock = {
    now: () => new Date(now),
};

testCacheContract(
    'MemoryCache',
    () => new MemoryCache(clock),
    durationMs => {
        now += durationMs;
    },
);
```

Contract suites define their own test groups and cases. Keep adapter-specific
tests alongside them for behavior outside the shared contract.

## TypeScript configuration

A minimal configuration for consumers using decorators is:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "strict": true
    }
}
```

Interop uses standard decorator context types such as
`ClassMethodDecoratorContext`; it does not use TypeScript's legacy decorator
signature.

## Development

```sh
git clone https://github.com/Little-Miss-Robot/interop-core.git
cd interop-core
npm install
```

Run the test suite:

```sh
npm test
```

Build ESM, CommonJS, source maps, and declarations:

```sh
npm run build
```

Before submitting a change, run both commands and add tests for observable
behavior.

## License

[ISC](./package.json) © Rein Van Oyen