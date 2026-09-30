import { ConsoleErrorReporter } from '../../src/implementations/diagnostics/ConsoleErrorReporter';
import { testErrorReporterContract } from '../../src/testsuite';

testErrorReporterContract(
    'ConsoleErrorReporter',
    () => new ConsoleErrorReporter(),
);
