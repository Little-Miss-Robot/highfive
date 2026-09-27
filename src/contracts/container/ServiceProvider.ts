import type { Dependencies } from './Container';

export interface ProviderContext<
    Provides extends Dependencies,
    Requires extends Dependencies,
> {
    make: <K extends keyof Requires>(
        name: K,
        ...args: Parameters<Requires[K]>
    ) => ReturnType<Requires[K]>

    bind: <K extends keyof Provides>(name: K, factory: Provides[K]) => void
    singleton: <K extends keyof Provides>(name: K, factory: Provides[K]) => void
}

export interface ServiceProvider<
    Provides extends Dependencies,
    Requires extends Dependencies = {},
> {
    register: (context: ProviderContext<Provides, Requires>) => void
}
