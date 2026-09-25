import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { LoggerDependencies } from '../logger/provider';
import type { Analytics } from './Analytics';
import LoggerAnalytics from './LoggerAnalytics';

export interface AnalyticsDependencies extends Dependencies {
    analytics: () => Analytics
}

const analyticsProvider: ServiceProvider<AnalyticsDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('analytics', () => {
            return new LoggerAnalytics(
                container.make('logger'),
            );
        });
    },
};

export default analyticsProvider;
