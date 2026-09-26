import type { Logger } from '../logger/Logger';
import type { Analytics, AnalyticsProperties } from './Analytics';

export default class LoggerAnalytics implements Analytics {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public track(event: string, properties: AnalyticsProperties | undefined): void {
        this.logger.info(`[Analytics] Event: ${event}, Data: ${JSON.stringify(properties)}`);
    }
}
