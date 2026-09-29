import type { Container, Dependencies } from '@contracts/container/Container';

export type Facades<B extends Dependencies> = {
    [K in keyof B]: (...args: Parameters<B[K]>) => ReturnType<B[K]>
};

export function createFacades<B extends Dependencies>(
    container: Container<B>,
): Facades<B> {
    const facades = Object.create(null) as Facades<B>;

    return new Proxy(facades, {
        get(target, key) {
            // An awaited facade object must not be treated as a promise.
            if (typeof key !== 'string' || key === 'then') {
                return undefined;
            }

            if (!Object.hasOwn(target, key)) {
                Object.defineProperty(target, key, {
                    value: (...args: unknown[]) => {
                        const make = container.make as (
                            this: Container<B>,
                            name: string,
                            ...args: unknown[]
                        ) => unknown;

                        return make.call(container, key, ...args);
                    },
                    enumerable: true,
                });
            }

            return Reflect.get(target, key);
        },
    });
}
