import type { Tracer } from './Tracer';

export class ConsoleTracer implements Tracer {
    async trace<T>(
        name: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        const startedAt = performance.now();

        try {
            const result = await operation();
            console.info(`[trace] ${name}`, {
                durationMs: performance.now() - startedAt,
                status: 'success',
            });
            return result;
        }
        catch (error) {
            console.error(`[trace] ${name}`, {
                durationMs: performance.now() - startedAt,
                status: 'error',
                error,
            });
            throw error;
        }
    }
}
