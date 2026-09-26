import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { EventBus } from './EventBus';
import InMemoryEventBus from './InMemoryEventBus';

export interface EventsDependencies<E extends object> extends Dependencies {
    eventBus: () => EventBus<E>
}

export function createEventsProvider<E extends object>(): ServiceProvider<EventsDependencies<E>> {
    return {
        register(container) {
            container.singleton('eventBus', () => {
                return new InMemoryEventBus<E>();
            });
        },
    };
}
