import { AdvanceableClock } from '../../src/fakes/clock/AdvanceableClock';
import { ConsoleLogger } from '../../src/implementations/logger/ConsoleLogger';
import { testLoggerContract } from '../../src/testsuite';

testLoggerContract(
    'ConsoleLogger',
    () => new ConsoleLogger(new AdvanceableClock()),
);
