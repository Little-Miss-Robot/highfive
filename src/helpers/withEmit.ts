import type { EventBus } from '@contracts/events/EventBus';

export function withEmit<
    E extends object,
    K extends keyof E & string,
>(
    bus: EventBus<E>,
    event: K,
) {
    return <Args extends unknown[]>(
        operation: (...args: Args) => Promise<E[K]>,
    ): (...args: Args) => Promise<E[K]> => {
        return async (...args: Args): Promise<E[K]> => {
            const result = await operation(...args);

            bus.emit(event, result);

            return result;
        };
    };
}
