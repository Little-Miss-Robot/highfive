import { SingleFlightDeduplicator } from '../../src/execution/SingleFlightDeduplicator';
import { testDeduplicatorContract } from '../../src/testsuite/execution/testDeduplicatorContract';

testDeduplicatorContract('SingleFlightDeduplicator', () => new SingleFlightDeduplicator());
