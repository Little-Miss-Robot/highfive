import type { Timeout } from '@contracts/execution/Timeout';

export function timeout(
    timeout: Timeout,
    durationMs: number,
) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return timeout.run(
                () => method.apply(this, args),
                durationMs,
            );
        };
    };
};
