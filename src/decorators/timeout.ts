import { resolve } from '@implementations/container/useContainer';

export function timeout(durationMs: number) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return resolve('timeout').run(
                () => method.apply(this, args),
                durationMs,
            );
        };
    };
};
