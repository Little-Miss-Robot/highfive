import { NothingLogger } from '../../src/fakes/logger/NothingLogger';
import { LoggerAnalytics } from '../../src/implementations/analytics/LoggerAnalytics';
import { testAnalyticsContract } from '../../src/testsuite';

testAnalyticsContract(
    'LoggerAnalytics',
    () => new LoggerAnalytics(new NothingLogger()),
);
