import type { Cache } from '@contracts/cache/Cache';
import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { ClockDependencies } from '@implementations/clock/provider';
import { MemoryCache } from '@implementations/cache/MemoryCache';

export interface CacheDependencies extends Dependencies {
    cache: () => Cache
}

const cacheProvider: ServiceProvider<CacheDependencies, ClockDependencies> = {
    register(container) {
        container.singleton('cache', () => new MemoryCache(
            container.make('clock'),
        ));
    },
};

export default cacheProvider;
