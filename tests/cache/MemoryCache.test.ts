import AdvanceableClock from '../../src/fakes/clock/AdvanceableClock';
import { MemoryCache } from '../../src/implementations/cache/MemoryCache';
import { testCacheContract } from '../../src/testsuite/cache/testCacheContract';

const clock = new AdvanceableClock();

testCacheContract(
    'MemoryCache',
    () => new MemoryCache(clock),
    durationMs => clock.advance(durationMs),
);
