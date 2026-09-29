# Container and ServiceProvider

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Container<B>` binds factories, binds lazy singletons, registers providers, and resolves services. `ServiceProvider<Provides, Requires>` describes the services a provider adds and the services it needs.

## Interfaces

```ts
type Dependencies = Record<string, (...args: any[]) => any>;

interface Container<B extends Dependencies> {
    readonly dependencyTypes: B;

    bind<K extends keyof B>(name: K, factory: B[K]): this;

    singleton<K extends keyof B>(name: K, factory: B[K]): this;

    register<
        Provides extends Dependencies,
        Requires extends Dependencies,
    >(
        provider: ServiceProvider<Provides, Requires>,
        ...missing: B extends Requires
            ? []
            : [error: 'Register required providers first']
    ): Container<B & Provides>;

    make<K extends keyof B>(
        name: K,
        ...args: Parameters<B[K]>
    ): ReturnType<B[K]>;
}

interface ProviderContext<
    Provides extends Dependencies,
    Requires extends Dependencies,
> {
    make: {
        <K extends keyof Provides>(
            name: K,
            ...args: Parameters<Provides[K]>
        ): ReturnType<Provides[K]>

        <K extends keyof Requires>(
            name: K,
            ...args: Parameters<Requires[K]>
        ): ReturnType<Requires[K]>
    };

    bind<K extends keyof Provides>(name: K, factory: Provides[K]): void;
    singleton<K extends keyof Provides>(name: K, factory: Provides[K]): void;
}

interface ServiceProvider<
    Provides extends Dependencies,
    Requires extends Dependencies = {},
> {
    register(context: ProviderContext<Provides, Requires>): void;
}
```

`dependencyTypes` carries the binding map for type inference. An implementation **MUST** include this property in its type and **MUST NOT** be required to assign it. Callers **MUST NOT** read it at runtime.

## Binding

1. `bind` and `singleton` **MUST** return the same container instance they were called on.
2. `make` of a name registered with `bind` **MUST** call that factory on every resolution.
3. `make` **MUST** forward its arguments to the factory. When a caller omits an optional argument, the factory **MUST** observe that omission.
4. Two results of `make` for a `bind` registration **MUST NOT** be the same value when the factory returns a new object on each call.

## Singletons

1. A factory registered with `singleton` **MUST NOT** be called until the first `make` of that name.
2. The first `make` **MUST** forward its arguments to the factory and **MUST** return the factory's result.
3. Every later `make` of that name **MUST** return that same result and **MUST NOT** call the factory again. Later arguments **MUST** be ignored.
4. Registering the same name again with `singleton` **MUST** discard the cached instance. The next `make` **MUST** call the new factory. Further resolutions **MUST** return that new instance.
5. Registering the same name again with `bind` **MUST** discard the cached instance. Each later `make` **MUST** call the new factory and **MUST** follow the binding rules above.

## Providers

1. `register` **MUST** call `provider.register` with a context before `register` returns.
2. `register` **MUST** return a container on which every service the provider adds can be resolved with `make`. The returned container **MAY** be the same instance.
3. `context.singleton` **MUST** follow the singleton rules in this document. `context.bind` **MUST** follow the binding rules.
4. A factory registered by a provider **MUST** be able to resolve a service named in `Requires` through `context.make`, when that service is already registered on the container.
5. If the container's bindings do not include every service in `Requires`, a TypeScript caller **MUST** get a type error from `register`. The extra argument in that error **MUST** be the string `'Register required providers first'`.

## Unspecified

This specification does not require a particular result when `make` is called for a name that has not been registered.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testContainerContract` checks the binding, singleton, and provider requirements. Requirement 5 of Providers and the `dependencyTypes` property are enforced by the type of `Container`.
