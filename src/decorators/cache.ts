import type { Cache } from '@contracts/cache/Cache';
import type { Serializer } from '@contracts/serializer/Serializer';

export function cached<KeyArgs extends unknown[]>(
    cache: Cache,
    keyOrKeyFor: string | ((...args: KeyArgs) => string),
    ttlMs?: number,
    options?: {
        serializer?: Serializer<string>
    },
) {
    return function <This, Args extends KeyArgs, Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext,
    ) {
        return async function (this: This, ...args: Args): Promise<Result> {
            const key = typeof keyOrKeyFor === 'string'
                ? keyOrKeyFor
                : keyOrKeyFor(...args);

            const cachedValue = await cache.get(key);

            if (cachedValue !== undefined) {
                if (options?.serializer) {
                    return options?.serializer.deserialize(cachedValue) as Result;
                }

                return JSON.parse(cachedValue) as Result;
            }

            const result = await method.apply(this, args);

            const serialized = (options?.serializer
                ? options.serializer.serialize(result)
                : JSON.stringify(result)
            );

            if (serialized !== undefined) {
                await cache.set(key, serialized, { ttlMs });
            }

            return result;
        };
    };
}
