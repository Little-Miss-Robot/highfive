type Factory = (...args: any[]) => any;

interface ContainerLike<
    D extends { [K in keyof D]: Factory },
> {
    readonly dependencyTypes: D

    make: <K extends keyof D>(
        name: K,
        ...args: Parameters<D[K]>
    ) => ReturnType<D[K]>
}

type Facades<D> = {
    [K in keyof D]: D[K] extends Factory
        ? (...args: Parameters<D[K]>) => ReturnType<D[K]>
        : never;
};

export function createFacades<
    D extends { [K in keyof D]: Factory },
>(container: ContainerLike<D>): Facades<D> {
    const facades = Object.create(null) as Facades<D>;

    return new Proxy(facades, {
        get(target, key) {
            if (typeof key !== 'string' || key === 'then') {
                return undefined;
            }

            if (!Object.hasOwn(target, key)) {
                Object.defineProperty(target, key, {
                    value: (...args: unknown[]) => {
                        const make = container.make as (
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
