import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { Logger } from '@contracts/logger/Logger';
import type { ClockDependencies } from '../clock/provider';
import { ConsoleLogger } from './ConsoleLogger';

export interface LoggerDependencies extends Dependencies {
    logger: () => Logger
}

export const loggerProvider: ServiceProvider<LoggerDependencies, ClockDependencies> = {
    register(container) {
        container.singleton('logger', () => new ConsoleLogger(
            container.make('clock'),
        ));
    },
};
