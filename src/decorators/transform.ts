import type { Transformer } from '@contracts/transformer/Transformer';

export function transform<In, Out>(transformer: Transformer<In, Out>) {
    return function <This, Args extends unknown[]>(
        method: (this: This, ...args: Args) => Promise<In>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<In>
        >,
    ) {
        return async function (
            this: This,
            ...args: Args
        ): Promise<Out> {
            const result = await method.apply(this, args);
            return transformer.transform(result);
        };
    };
}
