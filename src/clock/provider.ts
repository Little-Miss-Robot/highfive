import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Clock } from './Clock';
import CurrentTimeClock from './CurrentTimeClock';

export interface ClockDependencies extends Dependencies {
    clock: () => Clock
}

const clockProvider: ServiceProvider<ClockDependencies> = {
    register(container) {
        container.singleton('clock', () => new CurrentTimeClock());
    },
};

export default clockProvider;
