export enum LogLevel {
    ERROR,
    WARNING,
    INFO,
}

export interface Logger {
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
    log: (level: LogLevel, message: string) => void
}
