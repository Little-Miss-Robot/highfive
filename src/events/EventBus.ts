export type EventKey<E> = keyof E;

export type EventListener<E, K extends EventKey<E>> = (event: E[K]) => void;

export interface EventBus<E extends Record<PropertyKey, unknown>> {
    on: <K extends EventKey<E>>(eventKey: K, listener: EventListener<E, K>) => () => void
    emit: <K extends EventKey<E>>(eventKey: K, event: E[K]) => void
}
