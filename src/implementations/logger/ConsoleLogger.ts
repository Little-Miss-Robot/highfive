import type { Clock } from '@contracts/clock/Clock';
import type { Logger } from '@contracts/logger/Logger';
import { LogLevel } from '@contracts/logger/Logger';

export class ConsoleLogger implements Logger {
    private clock: Clock;

    constructor(clock: Clock) {
        this.clock = clock;
    }

    public log(level: LogLevel, message: string): void {
        switch (level) {
            case LogLevel.INFO:
                return this.info(message);
            case LogLevel.WARNING:
                return this.warning(message);
            case LogLevel.ERROR:
                return this.error(message);
        }
    }

    public error(message: string): void {
        console.error(`${this.clock.now().toISOString()} [ERROR] ${message}`);
    }

    public info(message: string): void {
        console.info(`${this.clock.now().toISOString()} [INFO] ${message}`);
    }

    public warning(message: string): void {
        console.warn(`${this.clock.now().toISOString()} [WARNING] ${message}`);
    }
}
