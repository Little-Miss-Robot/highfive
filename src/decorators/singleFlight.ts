import container from '../container';

export default function singleFlight<Args extends unknown[] = []>(keyFor?: (...args: Args) => string) {
    let methodId: string | undefined;
    const instanceIds = new WeakMap<object, string>();

    return function <This extends object, Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Result>>,
    ) {
        return function (this: This, ...args: Args): Promise<Result> {
            const idGenerator = container.make('idGenerator');
            methodId ??= idGenerator.generate();

            let instanceId = instanceIds.get(this);
            if (instanceId === undefined) {
                instanceId = idGenerator.generate();
                instanceIds.set(this, instanceId);
            }

            const key = JSON.stringify(['singleFlight', methodId, instanceId, keyFor?.(...args) ?? '']);
            return container.make('deduplicator').run(key, () => method.apply(this, args));
        };
    };
};
