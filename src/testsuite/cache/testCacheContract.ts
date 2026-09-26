import type { Cache } from '../../cache/Cache';
import { describe, expect, it } from 'vitest';

type AdvanceTime = (durationMs: number) => void | Promise<void>;

export function testCacheContract(
    name: string,
    createCache: () => Cache,
    advanceTime: AdvanceTime,
): void {
    describe(`${name}: Cache contract`, () => {
        let nextKey = 0;

        const key = () =>
            `cache-contract:${name}:${Date.now()}:${++nextKey}`;

        it('returns undefined for a missing key', async () => {
            expect(await createCache().get(key())).toBeUndefined();
        });

        it('stores and retrieves strings unchanged', async () => {
            const cache = createCache();
            const cacheKey = key();

            await cache.set(cacheKey, '');
            expect(await cache.get(cacheKey)).toBe('');

            await cache.set(cacheKey, '{"value":false}');
            expect(await cache.get(cacheKey)).toBe('{"value":false}');
        });

        it('keeps different keys independent', async () => {
            const cache = createCache();
            const firstKey = key();
            const secondKey = key();

            await cache.set(firstKey, 'first');
            await cache.set(secondKey, 'second');

            expect(await cache.get(firstKey)).toBe('first');
            expect(await cache.get(secondKey)).toBe('second');
        });

        it('replaces an existing value', async () => {
            const cache = createCache();
            const cacheKey = key();

            await cache.set(cacheKey, 'old');
            await cache.set(cacheKey, 'new');

            expect(await cache.get(cacheKey)).toBe('new');
        });

        it('deletes an entry', async () => {
            const cache = createCache();
            const cacheKey = key();

            await cache.set(cacheKey, 'value');
            await cache.delete(cacheKey);

            expect(await cache.get(cacheKey)).toBeUndefined();
        });

        it('expires an entry after its TTL', async () => {
            const cache = createCache();
            const cacheKey = key();

            await cache.set(cacheKey, 'value', { ttlMs: 2000 });
            expect(await cache.get(cacheKey)).toBe('value');

            await advanceTime(3000);

            expect(await cache.get(cacheKey)).toBeUndefined();
        });
    });
}
