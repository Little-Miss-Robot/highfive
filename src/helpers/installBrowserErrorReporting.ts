import type { ErrorReporter } from '@contracts/diagnostics/ErrorReporter';

export function installBrowserErrorReporting(
    reporter: ErrorReporter,
): () => void {
    const onError = (event: ErrorEvent): void => {
        reporter.report(event.error ?? new Error(event.message), {
            tags: { source: 'uncaught-exception' },
            extra: {
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
            },
        });
    };

    const onRejection = (event: PromiseRejectionEvent): void => {
        reporter.report(event.reason, {
            tags: { source: 'unhandled-rejection' },
        });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
    };
}
