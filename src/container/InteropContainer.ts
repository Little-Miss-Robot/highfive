import type { Container, Dependencies } from './Container';
import type { ProviderContext, ServiceProvider } from './ServiceProvider';

export class InteropContainer<B extends Dependencies> implements Container<B> {
    /**
     *
     * @private
     */
    private bindings: Partial<B> = {};

    /**
     *
     * @private
     */
    private singletonBindings: Partial<B> = {};

    /**
     *
     * @private
     */
    private instances: Partial<{ [K in keyof B]: ReturnType<B[K]> }> = {};

    /**
     * Binds a dependency to the container
     * NOTE: Re-registering a binding invalidates any cached singleton for that name
     * @param name
     * @param factory
     */
    public bind<K extends keyof B>(name: K, factory: B[K]): this {
        this.bindings[name] = factory;

        // If a (singleton) instance was already being kept for this name, delete it
        // We're effectively rebinding it be non-singleton now
        delete this.instances[name];

        // Delete it as a singleton binding
        delete this.singletonBindings[name];

        return this;
    }

    /**
     * Binds a singleton dependency to the container
     * NOTE: Re-registering a binding invalidates any cached singleton for that name
     * @param name
     * @param factory
     */
    public singleton<K extends keyof B>(name: K, factory: B[K]): this {
        this.singletonBindings[name] = factory;

        // If an instance was already being kept for this name, delete it
        delete this.instances[name];

        // Delete it as a regular binding
        delete this.bindings[name];

        return this;
    }

    /**
     * Register a service by ServiceProvider
     * @param provider
     * @param _missing
     */
    public register<
        Provides extends Dependencies,
        Requires extends Dependencies,
    >(
        provider: ServiceProvider<Provides, Requires>,
        ..._missing: B extends Requires ? [] : [error: 'Register required providers first']
    ): InteropContainer<B & Provides> {
        provider.register({
            make: this.make.bind(this),
            bind: this.bind.bind(this),
            singleton: this.singleton.bind(this),
        } as unknown as ProviderContext<Provides, Requires>);

        return this as unknown as InteropContainer<B & Provides>;
    }

    /**
     * Makes a dependency
     * @param name
     * @param args
     */
    public make<K extends keyof B>(name: K, ...args: Parameters<B[K]>): ReturnType<B[K]> {
        const singletonFactory = this.singletonBindings[name];
        if (singletonFactory) {
            if (!this.instances[name]) {
                this.instances[name] = singletonFactory(...args) as ReturnType<B[K]>;
            }
            return this.instances[name] as ReturnType<B[K]>;
        }

        const factory = this.bindings[name];
        if (!factory) {
            throw new Error(`No dependency was found for name "${String(name)}"`);
        }
        return (factory as B[K])(...args);
    }
}
