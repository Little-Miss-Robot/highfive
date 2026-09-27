import { SingleFlightDeduplicator } from '../../src/implementations/execution/SingleFlightDeduplicator';
import { testDeduplicatorContract } from '../../src/testsuite/execution/testDeduplicatorContract';

testDeduplicatorContract('SingleFlightDeduplicator', () => new SingleFlightDeduplicator());
