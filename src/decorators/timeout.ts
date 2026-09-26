import container from '../container';

export default function timeout(durationMs: number) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return container.make('timeout').run(
                () => method.apply(this, args),
                durationMs,
            );
        };
    };
};
