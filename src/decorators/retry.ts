import type { RetryOptions, RetryPolicy } from '@contracts/execution/RetryPolicy';

export function retry(retryPolicy: RetryPolicy, options: RetryOptions = {}) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Result>>,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return retryPolicy.run(() => method.apply(this, args), options);
        };
    };
}
