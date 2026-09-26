import type { Logger } from '../logger/Logger';
import type { Tracer } from './Tracer';

export class LogTracer implements Tracer {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    async trace<T>(
        name: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        const startedAt = performance.now();

        try {
            const result = await operation();
            this.logger.info(`[Trace] ${name} - Duration: ${performance.now() - startedAt} - Status: success`);
            return result;
        }
        catch (error) {
            this.logger.error(`[Trace] ${name} - Duration: ${performance.now() - startedAt} - Status: error - ${error}`);
            throw error;
        }
    }
}
