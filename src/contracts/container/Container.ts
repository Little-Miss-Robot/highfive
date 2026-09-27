import type { ServiceProvider } from './ServiceProvider';

export type Dependencies = Record<string, (...args: any[]) => any>;

export interface Container<B extends Dependencies> {
    bind: <K extends keyof B>(name: K, factory: B[K]) => this

    singleton: <K extends keyof B>(name: K, factory: B[K]) => this

    register: <
        Provides extends Dependencies,
        Requires extends Dependencies,
    >(
        provider: ServiceProvider<Provides, Requires>,
        ...missing: B extends Requires
            ? []
            : [error: 'Register required providers first']
    ) => Container<B & Provides>

    make: <K extends keyof B>(
        name: K,
        ...args: Parameters<B[K]>
    ) => ReturnType<B[K]>
}
