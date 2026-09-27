import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { EventBus } from '@contracts/events/EventBus';
import InMemoryEventBus from './InMemoryEventBus';

export interface EventsDependencies<E extends object> extends Dependencies {
    events: () => EventBus<E>
}

function eventsProvider<E extends object>(): ServiceProvider<EventsDependencies<E>> {
    return {
        register(container) {
            container.singleton('events', () => new InMemoryEventBus<E>());
        },
    };
}

export default eventsProvider;
