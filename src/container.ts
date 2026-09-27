import analyticsProvider from '@implementations/analytics/provider';
import cacheProvider from '@implementations/cache/provider';
import clockProvider from '@implementations/clock/provider';
import InteropContainer from '@implementations/container/InteropContainer';
import diagnosticsProvider from '@implementations/diagnostics/provider';
import eventsProvider from '@implementations/events/provider';
import executionProvider from '@implementations/execution/provider';
import httpProvider from '@implementations/http/provider';
import identifiersProvider from '@implementations/identifiers/provider';
import loggerProvider from '@implementations/logger/provider';

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
