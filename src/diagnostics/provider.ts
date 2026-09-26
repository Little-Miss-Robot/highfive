import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { LoggerDependencies } from '../logger/provider';
import type { Tracer } from './Tracer';
import { LogTracer } from './LogTracer';

export interface DiagnosticsDependencies extends Dependencies {
    tracer: () => Tracer
}

const diagnosticsProvider: ServiceProvider<DiagnosticsDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('tracer', () => {
            return new LogTracer(
                container.make('logger'),
            );
        });
    },
};

export default diagnosticsProvider;
