import type { Dependencies } from '@contracts/container/Container';
import type { AnalyticsDependencies } from '@implementations/analytics/provider';
import type { CacheDependencies } from '@implementations/cache/provider';
import type { ClockDependencies } from '@implementations/clock/provider';
import type { DiagnosticsDependencies } from '@implementations/diagnostics/provider';
import type { EventsDependencies } from '@implementations/events/provider';
import type { ExecutionDependencies } from '@implementations/execution/provider';
import type { HttpDependencies } from '@implementations/http/provider';
import type { IdentifiersDependencies } from '@implementations/identifiers/provider';
import type { LoggerDependencies } from '@implementations/logger/provider';
import { InteropContainer } from '@implementations/container/InteropContainer';

let activeContainer: unknown;

export type InteropDependencies<E extends object = object> =
    CacheDependencies
    & DiagnosticsDependencies
    & ExecutionDependencies
    & IdentifiersDependencies
    & LoggerDependencies
    & HttpDependencies
    & AnalyticsDependencies
    & ClockDependencies
    & EventsDependencies<E>;

export function createContainer<
    T extends Dependencies = {},
>(): InteropContainer<T> {
    return new InteropContainer<T>();
}

export function useContainer<T extends Dependencies>(
    value: InteropContainer<T>,
): () => InteropContainer<T> {
    activeContainer = value;
    return () => value;
}

export function resolve<K extends keyof InteropDependencies>(
    name: K,
    ...args: Parameters<InteropDependencies[K]>
): ReturnType<InteropDependencies[K]> {
    if (!activeContainer) {
        throw new Error('Interop has not been configured');
    }

    const container
        = activeContainer as InteropContainer<InteropDependencies>;

    return container.make(name, ...args);
}
