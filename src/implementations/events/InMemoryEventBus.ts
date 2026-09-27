import type { EventBus, EventKey, EventListener } from '@contracts/events/EventBus';

interface ListenerEntry<E, K extends EventKey<E>> {
    id: number
    listener: EventListener<E, K>
}

type ListenerMap<E> = {
    [K in EventKey<E>]?: ListenerEntry<E, K>[];
};

export class InMemoryEventBus<E extends object> implements EventBus<E> {
    /**
     * The current id
     * @private
     */
    private currentId = 0;

    /**
     * @private
     */
    private eventIdMap = new Map<number, EventKey<E>>();

    /**
     * The registered event listeners
     * @private
     */
    private listeners: ListenerMap<E> = {};

    /**
     * Adds an event listener
     * @param eventKey
     * @param listener
     */
    public on<K extends EventKey<E>>(eventKey: K, listener: EventListener<E, K>): () => void {
        const id = ++this.currentId;

        if (!this.listeners[eventKey]) {
            this.listeners[eventKey] = [];
        }

        this.eventIdMap.set(id, eventKey);
        this.listeners[eventKey]!.push({ id, listener });

        return () => this.off(id);
    }

    /**
     * Removes an event listener
     * @param eventId
     */
    private off(eventId: number): void {
        const eventKey = this.eventIdMap.get(eventId);

        if (eventKey === undefined) {
            return;
        }

        const listeners = this.listeners[eventKey];

        if (!listeners?.length) {
            return;
        }

        this.listeners[eventKey] = listeners.filter((entry) => {
            return entry.id !== eventId;
        });

        this.eventIdMap.delete(eventId);
    }

    /**
     * Emits an event with the given event data
     * @param eventKey
     * @param event
     */
    public emit<K extends EventKey<E>>(eventKey: K, event: E[K]): void {
        const listeners = this.listeners[eventKey];

        if (!listeners) {
            return;
        }

        listeners.forEach(({ listener }) => {
            listener(event);
        });
    }
}
