import type { Cache } from '@contracts/cache/Cache';
import type { Clock } from '@contracts/clock/Clock';

interface StoredEntry {
    value: string
    expiresAt: number | null
}

export class LocalStorageCache implements Cache {
    private readonly namespace: string;
    private readonly clock: Clock;

    constructor(namespace: string, clock: Clock) {
        this.namespace = namespace;
        this.clock = clock;
    }

    public async get(key: string): Promise<string | undefined> {
        const storageKey = this.key(key);
        const raw = window.localStorage.getItem(storageKey);

        if (raw === null) {
            return undefined;
        }

        const entry: unknown = JSON.parse(raw);

        if (!this.isEntry(entry)) {
            throw new Error(`Invalid cache entry: ${storageKey}`);
        }

        if (entry.expiresAt !== null && entry.expiresAt <= this.clock.now().getTime()) {
            window.localStorage.removeItem(storageKey);
            return undefined;
        }

        return entry.value;
    }

    public async set(
        key: string,
        value: string,
        options: { ttlMs?: number } = {},
    ): Promise<void> {
        const { ttlMs } = options;

        if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
            throw new RangeError('ttlMs must be a positive finite number');
        }

        const entry: StoredEntry = {
            value,
            expiresAt: ttlMs === undefined ? null : this.clock.now().getTime() + ttlMs,
        };

        window.localStorage.setItem(this.key(key), JSON.stringify(entry));
    }

    public async delete(key: string): Promise<void> {
        window.localStorage.removeItem(this.key(key));
    }

    private key(key: string): string {
        return `interop:${this.namespace}:${key}`;
    }

    private isEntry(value: unknown): value is StoredEntry {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const entry = value as Record<string, unknown>;

        return typeof entry.value === 'string'
            && (
                entry.expiresAt === null
                || (
                    typeof entry.expiresAt === 'number'
                    && Number.isFinite(entry.expiresAt)
                )
            );
    }
}
