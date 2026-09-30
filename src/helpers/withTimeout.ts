import type { Timeout } from '@contracts/execution/Timeout';

export function withTimeout(timeout: Timeout, durationMs: number) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        return (...args: Args): Promise<Result> => {
            return timeout.run(
                () => operation(...args),
                durationMs,
            );
        };
    };
}
