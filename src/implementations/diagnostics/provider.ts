import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { ErrorReporter } from '@contracts/diagnostics/ErrorReporter';
import type { Tracer } from '@contracts/diagnostics/Tracer';
import type { LoggerDependencies } from '@implementations/logger/provider';
import { ConsoleErrorReporter } from '@implementations/diagnostics/ConsoleErrorReporter';
import { LogTracer } from './LogTracer';

export interface DiagnosticsDependencies extends Dependencies {
    tracer: () => Tracer
    errorReporter: () => ErrorReporter
}

export const diagnosticsProvider: ServiceProvider<DiagnosticsDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('tracer', () => {
            return new LogTracer(
                container.make('logger'),
            );
        });

        container.singleton('errorReporter', () => {
            return new ConsoleErrorReporter();
        });
    },
};
