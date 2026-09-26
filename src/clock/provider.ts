import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Clock } from './Clock';
import SystemClock from './SystemClock';

export interface ClockDependencies extends Dependencies {
    clock: () => Clock
}

const clockProvider: ServiceProvider<ClockDependencies> = {
    register(container) {
        container.singleton('clock', () => new SystemClock());
    },
};

export default clockProvider;
