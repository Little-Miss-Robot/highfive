import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Deduplicator } from './Deduplicator';
import type { RetryPolicy } from './RetryPolicy';
import type { Timeout } from './Timeout';
import { DefaultRetryPolicy } from './DefaultRetryPolicy';
import DefaultTimeout from './DefaultTimeout';
import { SingleFlightDeduplicator } from './SingleFlightDeduplicator';

export interface ExecutionDependencies extends Dependencies {
    deduplicator: () => Deduplicator
    retryPolicy: () => RetryPolicy
    timeout: () => Timeout
}

const executionProvider: ServiceProvider<ExecutionDependencies> = {
    register(container) {
        container.singleton('deduplicator', () => {
            return new SingleFlightDeduplicator();
        });

        container.singleton('retryPolicy', () => {
            return new DefaultRetryPolicy();
        });

        container.singleton('timeout', () => {
            return new DefaultTimeout();
        });
    },
};

export default executionProvider;
