import type { Clock } from '../../src/contracts/clock/Clock';
import type { Container, Dependencies } from '../../src/contracts/container/Container';
import type { ServiceProvider } from '../../src/contracts/container/ServiceProvider';
import { describe, expect, it } from 'vitest';
import { createFacades } from '../../src/helpers/createFacades';
import { clockProvider } from '../../src/implementations/clock/provider';
import { DefaultContainer } from '../../src/implementations/container/DefaultContainer';

interface AppDependencies extends Dependencies {
    clock: () => { now: () => number }
    label: (name: string, excited?: boolean) => string
    box: () => { id: number }
}

class StubContainer<B extends Dependencies> implements Container<B> {
    declare readonly dependencyTypes: B;

    private readonly factories = new Map<keyof B, B[keyof B]>();

    public bind<K extends keyof B>(name: K, factory: B[K]): this {
        this.factories.set(name, factory);
        return this;
    }

    public singleton<K extends keyof B>(name: K, factory: B[K]): this {
        return this.bind(name, factory);
    }

    public register<
        Provides extends Dependencies,
        Requires extends Dependencies,
    >(
        _provider: ServiceProvider<Provides, Requires>,
        ..._missing: B extends Requires ? [] : [error: 'Register required providers first']
    ): Container<B & Provides> {
        return this as unknown as Container<B & Provides>;
    }

    public make<K extends keyof B>(name: K, ...args: Parameters<B[K]>): ReturnType<B[K]> {
        const factory = this.factories.get(name);

        if (!factory) {
            throw new Error(`Missing ${String(name)}`);
        }

        return factory(...args);
    }
}

function createAppContainer(): StubContainer<AppDependencies> {
    return new StubContainer<AppDependencies>()
        .bind('clock', () => ({ now: () => 1 }))
        .bind('label', (name, excited) => excited ? `${name}!` : name)
        .bind('box', () => ({ id: 1 }));
}

type Expect<T extends true> = T;
type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;

const stubFacades = createFacades(createAppContainer());
const contractFacades = createFacades(createAppContainer() as Container<AppDependencies>);
const defaultFacades = createFacades(new DefaultContainer<AppDependencies>());
const registeredFacades = createFacades(new DefaultContainer().register(clockProvider));

type _StubLabel = Expect<Equal<
    typeof stubFacades.label,
    (name: string, excited?: boolean) => string
>>;
type _ContractLabel = Expect<Equal<
    typeof contractFacades.label,
    (name: string, excited?: boolean) => string
>>;
type _DefaultLabel = Expect<Equal<
    typeof defaultFacades.label,
    (name: string, excited?: boolean) => string
>>;
type _RegisteredClock = Expect<Equal<
    ReturnType<typeof registeredFacades.clock>,
    Clock
>>;

describe('createFacades', () => {
    it('forwards each call to make on any Container', () => {
        const { label } = createFacades(createAppContainer());

        expect(label('Ada')).toBe('Ada');
        expect(label('Ada', true)).toBe('Ada!');
    });

    it('keeps singleton and binding behavior on the container', () => {
        const container = new DefaultContainer<AppDependencies>()
            .singleton('clock', () => ({ now: () => 1 }))
            .bind('box', () => ({ id: 1 }))
            .bind('label', name => name);

        const { clock, box } = createFacades(container);

        expect(clock()).toBe(clock());
        expect(box()).not.toBe(box());
    });

    it('calls make with the container as this', () => {
        const { clock } = createFacades(createAppContainer());

        expect(clock().now()).toBe(1);
    });

    it('propagates a missing dependency from the container', () => {
        const { label } = createFacades(new StubContainer<AppDependencies>());

        expect(() => label('Ada')).toThrow('Missing label');
    });

    it('is not treated as a promise', async () => {
        const facades = createFacades(createAppContainer());

        await expect(Promise.resolve(facades)).resolves.toBe(facades);
    });
});
