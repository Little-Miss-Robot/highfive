import type { Deduplicator } from '@contracts/execution/Deduplicator';
import type { IdGenerator } from '@contracts/identifiers/IdGenerator';

export function withSingleFlight(
    deduplicator: Deduplicator,
    idGenerator: IdGenerator,
): <Args extends unknown[], Result>(
    operation: (...args: Args) => Promise<Result>,
) => (...args: Args) => Promise<Result>;

export function withSingleFlight<Args extends unknown[]>(
    deduplicator: Deduplicator,
    idGenerator: IdGenerator,
    keyFor: (...args: Args) => string,
): <Result>(
    operation: (...args: Args) => Promise<Result>,
) => (...args: Args) => Promise<Result>;

export function withSingleFlight(
    deduplicator: Deduplicator,
    idGenerator: IdGenerator,
    keyFor?: (...args: any[]) => string,
) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        let operationId: string | undefined;

        return (...args: Args): Promise<Result> => {
            operationId ??= idGenerator.generate();

            const key = JSON.stringify([
                'singleFlight',
                operationId,
                keyFor?.(...args) ?? '',
            ]);

            return deduplicator.run(key, () => operation(...args));
        };
    };
}
