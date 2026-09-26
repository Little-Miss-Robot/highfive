import type { ClockDependencies } from '../clock/provider';
import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Cache } from './Cache';
import { MemoryCache } from './MemoryCache';

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
