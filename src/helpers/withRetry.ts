import type { RetryOptions, RetryPolicy } from '@contracts/execution/RetryPolicy';

export function withRetry(retryPolicy: RetryPolicy, options: RetryOptions = {}) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        return (...args: Args): Promise<Result> => {
            return retryPolicy.run(() => operation(...args), options);
        };
    };
}
