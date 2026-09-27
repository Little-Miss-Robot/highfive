import type { Tracer } from '@contracts/diagnostics/Tracer';

export function trace(tracer: Tracer, name?: string) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return tracer.trace(
                name ?? String(context.name),
                () => method.apply(this, args),
            );
        };
    };
}
