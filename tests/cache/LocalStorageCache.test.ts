import { beforeEach } from 'vitest';
import AdvanceableClock from '../../src/fakes/clock/AdvanceableClock';
import { LocalStorageCache } from '../../src/implementations/cache/LocalStorageCache';
import { testCacheContract } from '../../src/testsuite/cache/testCacheContract';

const clock = new AdvanceableClock();

beforeEach(() => {
    window.localStorage.clear();
});

testCacheContract(
    'MemoryCache',
    () => new LocalStorageCache('test', clock),
    durationMs => clock.advance(durationMs),
);
