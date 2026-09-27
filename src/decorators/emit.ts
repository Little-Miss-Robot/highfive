import type { EventBus } from '@contracts/events/EventBus';

export default function emit<
    E extends object,
    K extends keyof E & string,
>(
    bus: EventBus<E>,
    event: K,
) {
    return function <
        This,
        Args extends unknown[],
        Result extends E[K],
    >(
        method: (this: This, ...args: Args) => Promise<Result>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return async function (this: This, ...args: Args): Promise<Result> {
            const result = await method.apply(this, args);
            bus.emit(event, result);
            return result;
        };
    };
}
