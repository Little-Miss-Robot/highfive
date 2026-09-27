import type { Clock } from '@contracts/clock/Clock';
import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import { SystemClock } from './SystemClock';

export interface ClockDependencies extends Dependencies {
    clock: () => Clock
}

export const clockProvider: ServiceProvider<ClockDependencies> = {
    register(container) {
        container.singleton('clock', () => new SystemClock());
    },
};
