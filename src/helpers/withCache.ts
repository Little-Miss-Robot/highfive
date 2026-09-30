import type { Cache } from '@contracts/cache/Cache';
import type { Serializer } from '@contracts/serializer/Serializer';

interface CacheOptions {
    serializer?: Serializer<string>
}

export function withCache(
    cache: Cache,
    key: string,
    ttlMs?: number,
    options?: CacheOptions,
): <Args extends unknown[], Result>(
    operation: (...args: Args) => Promise<Result>,
) => (...args: Args) => Promise<Result>;

export function withCache<KeyArgs extends unknown[]>(
    cache: Cache,
    keyFor: (...args: KeyArgs) => string,
    ttlMs?: number,
    options?: CacheOptions,
): <Result>(
    operation: (...args: KeyArgs) => Promise<Result>,
) => (...args: KeyArgs) => Promise<Result>;

export function withCache(
    cache: Cache,
    keyOrKeyFor: string | ((...args: any[]) => string),
    ttlMs?: number,
    options?: CacheOptions,
) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        return async (...args: Args): Promise<Result> => {
            const key = typeof keyOrKeyFor === 'string'
                ? keyOrKeyFor
                : keyOrKeyFor(...args);

            const cachedValue = await cache.get(key);

            if (cachedValue !== undefined) {
                if (options?.serializer) {
                    return options.serializer.deserialize(cachedValue) as Result;
                }

                return JSON.parse(cachedValue) as Result;
            }

            const result = await operation(...args);

            const serialized = options?.serializer
                ? options.serializer.serialize(result)
                : JSON.stringify(result);

            if (serialized !== undefined) {
                await cache.set(key, serialized, { ttlMs });
            }

            return result;
        };
    };
}
