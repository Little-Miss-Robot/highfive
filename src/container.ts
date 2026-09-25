import analyticsProvider from './analytics/provider';
import { Container } from './container/Container';
import executionProvider from './execution/provider';
import httpProvider from './http/provider';
import identifiersProvider from './identifiers/provider';
import loggerProvider from './logger/provider';

const container = new Container()
    .register(identifiersProvider)
    .register(executionProvider)
    .register(loggerProvider)
    .register(httpProvider)
    .register(analyticsProvider)
;

export default container;
