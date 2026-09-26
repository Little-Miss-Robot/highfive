import analyticsProvider from './analytics/provider';
import cacheProvider from './cache/provider';
import clockProvider from './clock/provider';
import { InteropContainer } from './container/InteropContainer';
import diagnosticsProvider from './diagnostics/provider';
import eventsProvider from './events/provider';
import executionProvider from './execution/provider';
import httpProvider from './http/provider';
import identifiersProvider from './identifiers/provider';
import loggerProvider from './logger/provider';

export interface DadjokeEvents {
    received: string
}

const container = new InteropContainer()
    .register(identifiersProvider)
    .register(clockProvider)
    .register(loggerProvider)
    .register(diagnosticsProvider)
    .register(executionProvider)
    .register(cacheProvider)
    .register(httpProvider)
    .register(analyticsProvider)
    .register(eventsProvider<DadjokeEvents>())
;

export default container;
