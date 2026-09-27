import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { Tracer } from '@contracts/diagnostics/Tracer';
import type { LoggerDependencies } from '@implementations/logger/provider';
import { LogTracer } from './LogTracer';

export interface DiagnosticsDependencies extends Dependencies {
    tracer: () => Tracer
}

export const diagnosticsProvider: ServiceProvider<DiagnosticsDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('tracer', () => {
            return new LogTracer(
                container.make('logger'),
            );
        });
    },
};
