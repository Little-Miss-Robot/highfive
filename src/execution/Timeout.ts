export interface Timeout {
    run: <T>(
        operation: (signal: AbortSignal) => Promise<T>,
        durationMs: number,
        signal?: AbortSignal,
    ) => Promise<T>
}
