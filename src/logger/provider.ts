import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { Logger } from './Logger';
import ConsoleLogger from './ConsoleLogger';

export interface LoggerDependencies extends Dependencies {
    logger: () => Logger
}

const loggerProvider: ServiceProvider<LoggerDependencies> = {
    register(container) {
        container.singleton('logger', () => new ConsoleLogger());
    },
};

export default loggerProvider;
