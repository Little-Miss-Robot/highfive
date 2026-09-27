export interface RetryOptions {
    attempts?: number
    delayMs?: number
    shouldRetry?: (error: unknown, failedAttempt: number) => boolean
}

export interface RetryPolicy {
    run: <T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions) => Promise<T>
}
