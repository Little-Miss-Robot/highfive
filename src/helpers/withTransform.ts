import type { Transformer } from '@contracts/transformer/Transformer';

export function withTransform<In, Out>(transformer: Transformer<In, Out>) {
    return <Args extends unknown[]>(
        operation: (...args: Args) => Promise<In>,
    ): ((...args: Args) => Promise<Out>) => {
        return async (...args: Args): Promise<Out> => {
            const result = await operation(...args);
            return transformer.transform(result);
        };
    };
}
