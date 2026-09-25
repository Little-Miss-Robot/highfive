import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Deduplicator } from './Deduplicator';
import type { RetryPolicy } from './RetryPolicy';
import type { Tracer } from './Tracer';
import { ConsoleTracer } from './ConsoleTracer';
import { DefaultRetryPolicy } from './DefaultRetryPolicy';
import { SingleFlightDeduplicator } from './SingleFlightDeduplicator';

export interface ExecutionDependencies extends Dependencies {
    deduplicator: () => Deduplicator
    retryPolicy: () => RetryPolicy
    tracer: () => Tracer
}

const executionProvider: ServiceProvider<ExecutionDependencies> = {
    register(container) {
        container.singleton('deduplicator', () => {
            return new SingleFlightDeduplicator();
        });

        container.singleton('retryPolicy', () => {
            return new DefaultRetryPolicy();
        });

        container.singleton('tracer', () => {
            return new ConsoleTracer();
        });
    },
};

export default executionProvider;
