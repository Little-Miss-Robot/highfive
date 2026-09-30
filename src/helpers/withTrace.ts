import type { Tracer } from '@contracts/diagnostics/Tracer';

export function withTrace(tracer: Tracer, name?: string) {
    return <Args extends unknown[], Result>(
        operation: (...args: Args) => Promise<Result>,
    ): (...args: Args) => Promise<Result> => {
        const traceName = name ?? (operation.name || '<anonymous>');

        return (...args: Args): Promise<Result> => {
            return tracer.trace(traceName, () => operation(...args));
        };
    };
}
