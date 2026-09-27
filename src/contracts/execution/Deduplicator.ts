export interface Deduplicator {
    run: <T>(key: string, operation: () => Promise<T>) => Promise<T>
}
