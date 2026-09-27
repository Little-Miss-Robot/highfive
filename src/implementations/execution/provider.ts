import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { Deduplicator } from '@contracts/execution/Deduplicator';
import type { RetryPolicy } from '@contracts/execution/RetryPolicy';
import type { Timeout } from '@contracts/execution/Timeout';
import { DefaultRetryPolicy } from './DefaultRetryPolicy';
import { DefaultTimeout } from './DefaultTimeout';
import { SingleFlightDeduplicator } from './SingleFlightDeduplicator';

export interface ExecutionDependencies extends Dependencies {
    deduplicator: () => Deduplicator
    retryPolicy: () => RetryPolicy
    timeout: () => Timeout
}

export const executionProvider: ServiceProvider<ExecutionDependencies> = {
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
