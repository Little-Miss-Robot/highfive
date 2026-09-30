import type { ErrorReportContext, ErrorReporter } from '@contracts/diagnostics/ErrorReporter';

export class ConsoleErrorReporter implements ErrorReporter {
    report(error: unknown, context?: ErrorReportContext): void {
        console.error(error, context);
    }
}
