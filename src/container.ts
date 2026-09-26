import type { EventBus } from './events/EventBus';
import analyticsProvider from './analytics/provider';
import clockProvider from './clock/provider';
import { Container } from './container/Container';
import InMemoryEventBus from './events/InMemoryEventBus';
import eventsProvider from './events/provider';
import executionProvider from './execution/provider';
import httpProvider from './http/provider';
import identifiersProvider from './identifiers/provider';
import loggerProvider from './logger/provider';

const container = new Container<{
    authEvents: () => EventBus<{
        loggedin: { name: string }
    }>
}>()
    .register(identifiersProvider)
    .register(clockProvider)
    .register(executionProvider)
    .register(loggerProvider)
    .register(httpProvider)
    .register(analyticsProvider)
    .register(eventsProvider<{
        click: { id: string }
    }>())
    .singleton('authEvents', () => new InMemoryEventBus())
;

container.make('authEvents').emit('loggedin', { name: 'nice' });

container.make('events').emit('click', { id: 'Nice!' });

export default container;
