import type { RetryOptions, RetryPolicy } from './RetryPolicy';

export class DefaultRetryPolicy implements RetryPolicy {
    async run<T>(operation: (attempt: number) => Promise<T>, options: RetryOptions = {}): Promise<T> {
        const { attempts = 3, delayMs = 0, shouldRetry = () => true } = options;

        if (!Number.isSafeInteger(attempts) || attempts < 1) {
            throw new RangeError('attempts must be a positive integer');
        }
        if (!Number.isFinite(delayMs) || delayMs < 0) {
            throw new RangeError('delayMs must be a non-negative finite number');
        }

        for (let attempt = 1; ; attempt++) {
            try {
                return await operation(attempt);
            }
            catch (error) {
                if (attempt >= attempts || !shouldRetry(error, attempt)) {
                    throw error;
                }
                if (delayMs > 0) {
                    await new Promise<void>(resolve => setTimeout(resolve, delayMs));
                }
            }
        }
    }
}
