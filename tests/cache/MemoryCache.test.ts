import { AdvanceableClock } from '../../src/fakes/clock/AdvanceableClock';
import { InMemoryCache } from '../../src/implementations/cache/InMemoryCache';
import { testCacheContract } from '../../src/testsuite/cache/testCacheContract';

const clock = new AdvanceableClock();

testCacheContract(
    'MemoryCache',
    () => new InMemoryCache(clock),
    durationMs => clock.advance(durationMs),
);
