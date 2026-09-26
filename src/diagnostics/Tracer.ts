export interface Tracer {
    trace: <T>(name: string, operation: () => Promise<T>) => Promise<T>
}
