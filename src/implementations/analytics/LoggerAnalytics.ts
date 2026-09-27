import type { Analytics, AnalyticsPayload } from '@contracts/analytics/Analytics';
import type { Logger } from '@contracts/logger/Logger';

export default class LoggerAnalytics implements Analytics {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public track(event: string, properties: AnalyticsPayload | undefined): void {
        this.logger.info(`[Analytics] Event: ${event}, Data: ${JSON.stringify(properties)}`);
    }
}
