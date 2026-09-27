import type { Container, Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import { describe, expect, it } from 'vitest';

export interface ContainerContractDependencies extends Dependencies {
    item: (label?: string) => { label: string }
    name: () => string
}

interface TitleDependencies extends Dependencies {
    title: () => string
}

interface GreetingDependencies extends Dependencies {
    greeting: () => string
}

interface NameDependencies extends Dependencies {
    name: () => string
}

interface BoxDependencies extends Dependencies {
    box: () => { n: number }
}

export function testContainerContract(
    name: string,
    createContainer: () => Container<ContainerContractDependencies>,
): void {
    describe(`${name}: Container contract`, () => {
        it('returns the same container from bind and singleton', () => {
            const container = createContainer();

            expect(container.bind('name', () => 'Ada')).toBe(container);
            expect(container.singleton('item', () => ({ label: 'shared' }))).toBe(container);
        });

        it('creates a new instance every time a binding is resolved', () => {
            const container = createContainer();
            let calls = 0;

            container.bind('item', () => {
                calls++;
                return { label: String(calls) };
            });

            const first = container.make('item');
            const second = container.make('item');

            expect(first).toEqual({ label: '1' });
            expect(second).toEqual({ label: '2' });
            expect(first).not.toBe(second);
            expect(calls).toBe(2);
        });

        it('forwards arguments to a binding', () => {
            const container = createContainer();

            container.bind('item', (label = 'fallback') => ({ label }));

            expect(container.make('item', 'box')).toEqual({ label: 'box' });
            expect(container.make('item')).toEqual({ label: 'fallback' });
        });

        it('reuses one lazily created singleton', () => {
            const container = createContainer();
            let calls = 0;

            container.singleton('item', (label = 'fallback') => {
                calls++;
                return { label };
            });

            expect(calls).toBe(0);

            const first = container.make('item', 'shared');
            const second = container.make('item', 'other');

            expect(calls).toBe(1);
            expect(first).toBe(second);
            expect(first).toEqual({ label: 'shared' });
        });

        it('replaces a singleton when it is rebound', () => {
            const container = createContainer();

            container.singleton('item', () => ({ label: 'first' }));
            const first = container.make('item');

            container.singleton('item', () => ({ label: 'second' }));
            const second = container.make('item');

            expect(second).toEqual({ label: 'second' });
            expect(second).not.toBe(first);
            expect(container.make('item')).toBe(second);
        });

        it('resolves a new instance on every call after a singleton is rebound with bind', () => {
            const container = createContainer();

            container.singleton('item', () => ({ label: 'first' }));
            const first = container.make('item');

            container.bind('item', () => ({ label: 'second' }));
            const second = container.make('item');
            const third = container.make('item');

            expect(second).toEqual({ label: 'second' });
            expect(third).toEqual({ label: 'second' });
            expect(second).not.toBe(first);
            expect(third).not.toBe(second);
        });

        it('resolves a lazy singleton registered by a provider', () => {
            let calls = 0;
            const provider: ServiceProvider<TitleDependencies> = {
                register(context) {
                    context.singleton('title', () => {
                        calls++;
                        return 'Interop';
                    });
                },
            };
            const container = createContainer().register(provider);

            expect(calls).toBe(0);
            expect(container.make('title')).toBe('Interop');
            expect(container.make('title')).toBe('Interop');
            expect(calls).toBe(1);
        });

        it('lets a provider resolve a service it requires', () => {
            const container = createContainer();

            container.bind('name', () => 'Ada');

            const provider: ServiceProvider<GreetingDependencies, NameDependencies> = {
                register(context) {
                    context.singleton('greeting', () => `Hello ${context.make('name')}`);
                },
            };

            expect(container.register(provider).make('greeting')).toBe('Hello Ada');
        });

        it('resolves a new instance on every call when a provider uses bind', () => {
            let calls = 0;
            const provider: ServiceProvider<BoxDependencies> = {
                register(context) {
                    context.bind('box', () => {
                        calls++;
                        return { n: calls };
                    });
                },
            };
            const container = createContainer().register(provider);
            const first = container.make('box');
            const second = container.make('box');

            expect(calls).toBe(2);
            expect(first).toEqual({ n: 1 });
            expect(second).toEqual({ n: 2 });
            expect(first).not.toBe(second);
        });
    });
}
