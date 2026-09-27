import type { Logger, LogLevel } from '@contracts/logger/Logger';

export class NothingLogger implements Logger {
    error(_message: string): void {}

    info(_message: string): void {}

    log(_level: LogLevel, _message: string): void {}

    warning(_message: string): void {}
}
