import type { Logger } from '../logger/Logger';
import type { HttpClient } from './HttpClient';

export default class LogHttpClient implements HttpClient {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    say(message: string): void {
        this.logger.log(message);
    }
}
