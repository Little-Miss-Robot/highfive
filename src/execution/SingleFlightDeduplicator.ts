import type { Deduplicator } from './Deduplicator';

export class SingleFlightDeduplicator implements Deduplicator {
    private readonly pending = new Map<string, Promise<unknown>>();

    public run<T>(key: string, operation: () => Promise<T>): Promise<T> {
        const existing = this.pending.get(key);

        if (existing) {
            return existing as Promise<T>;
        }

        const promise = Promise.resolve()
            .then(operation)
            .finally(() => {
                this.pending.delete(key);
            });

        this.pending.set(key, promise);

        return promise;
    }
}
