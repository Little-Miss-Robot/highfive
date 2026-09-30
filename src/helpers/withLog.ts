import type { Logger } from '@contracts/logger/Logger';

export function withLog(
    logger: Logger,
    formatResult: (value: unknown) => string = String,
    name?: string,
) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        const label = name ?? (operation.name || '<anonymous>');

        return async (...args: Args): Promise<Result> => {
            const result = await operation(...args);

            logger.info(`${label} returned: ${formatResult(result)}`);

            return result;
        };
    };
}
