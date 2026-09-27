import { resolve } from '@implementations/container';

export function trace(name?: string) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            return resolve('tracer').trace(
                name ?? String(context.name),
                () => method.apply(this, args),
            );
        };
    };
}
