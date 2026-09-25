import type { RetryOptions } from '../execution/RetryPolicy';
import container from '../container';

export function retry(options: RetryOptions = {}) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Result>>,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return container.make('retryPolicy').run(() => method.apply(this, args), options);
        };
    };
}
