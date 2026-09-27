import type { Cache } from '@contracts/cache/Cache';
import type { Clock } from '@contracts/clock/Clock';

interface Entry {
    value: string
    expiresAt: number | null
}

export class MemoryCache implements Cache {
    private readonly clock: Clock;
    private readonly entries = new Map<string, Entry>();

    constructor(clock: Clock) {
        this.clock = clock;
    }

    async get(key: string): Promise<string | undefined> {
        const entry = this.entries.get(key);

        if (entry === undefined) {
            return undefined;
        }

        if (
            entry.expiresAt !== null
            && entry.expiresAt <= this.clock.now().getTime()
        ) {
            this.entries.delete(key);
            return undefined;
        }

        return entry.value;
    }

    async set(
        key: string,
        value: string,
        options: { ttlMs?: number } = {},
    ): Promise<void> {
        const { ttlMs } = options;

        if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
            throw new RangeError('ttlMs must be a positive finite number');
        }

        this.entries.set(key, {
            value,
            expiresAt: ttlMs === undefined
                ? null
                : this.clock.now().getTime() + ttlMs,
        });
    }

    async delete(key: string): Promise<void> {
        this.entries.delete(key);
    }
}
