import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { EventBus } from './EventBus';
import InMemoryEventBus from './InMemoryEventBus';

export interface EventsDependencies<E extends object> extends Dependencies {
    eventBus: () => EventBus<E>
}

const eventsProvider = <E extends object>(): ServiceProvider<EventsDependencies<E>> => ({
    register(container) {
        container.singleton('eventBus', () => new InMemoryEventBus<E>());
    },
});

export default eventsProvider;
