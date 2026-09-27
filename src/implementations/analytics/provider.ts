import type { Analytics } from '@contracts/analytics/Analytics';
import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { LoggerDependencies } from '@implementations/logger/provider';
import { LoggerAnalytics } from '@implementations/analytics/LoggerAnalytics';

export interface AnalyticsDependencies extends Dependencies {
    analytics: () => Analytics
}

export const analyticsProvider: ServiceProvider<AnalyticsDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('analytics', () => {
            return new LoggerAnalytics(
                container.make('logger'),
            );
        });
    },
};
