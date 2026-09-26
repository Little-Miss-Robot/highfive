import container from '../container';

export default function cache<KeyArgs extends unknown[]>(
    keyOrKeyFor: string | ((...args: KeyArgs) => string),
    ttlMs?: number,
) {
    return function <This, Args extends KeyArgs, Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext,
    ) {
        return async function (this: This, ...args: Args): Promise<Result> {
            const key = typeof keyOrKeyFor === 'string'
                ? keyOrKeyFor
                : keyOrKeyFor(...args);

            const cache = container.make('cache');
            const cachedValue = await cache.get(key);

            if (cachedValue !== undefined) {
                return JSON.parse(cachedValue) as Result;
            }

            const result = await method.apply(this, args);
            const serialized = JSON.stringify(result);

            if (serialized !== undefined) {
                await cache.set(key, serialized, { ttlMs });
            }

            return result;
        };
    };
}
