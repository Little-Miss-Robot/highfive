export interface ErrorReportContext {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
}

export interface ErrorReporter {
    report: (error: unknown, context?: ErrorReportContext) => void
}
