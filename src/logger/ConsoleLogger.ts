import type { Logger } from './Logger';

export default class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
    }
}
