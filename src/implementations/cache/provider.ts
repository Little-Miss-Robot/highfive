import type { Cache } from '@contracts/cache/Cache';
import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { ClockDependencies } from '@implementations/clock/provider';
import { InMemoryCache } from '@implementations/cache/InMemoryCache';

export interface CacheDependencies extends Dependencies {
    cache: () => Cache
}

export const cacheProvider: ServiceProvider<CacheDependencies, ClockDependencies> = {
    register(container) {
        container.singleton('cache', () => new InMemoryCache(
            container.make('clock'),
        ));
    },
};
