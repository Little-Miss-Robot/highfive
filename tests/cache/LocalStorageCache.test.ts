import { beforeEach } from 'vitest';
import { LocalStorageCache } from '../../src/cache/LocalStorageCache';
import { testCacheContract } from '../../src/testsuite/cache/testCacheContract';
import AdvanceableClock from '../fakes/AdvanceableClock';

const clock = new AdvanceableClock();

beforeEach(() => {
    window.localStorage.clear();
});

testCacheContract(
    'MemoryCache',
    () => new LocalStorageCache('test', clock),
    durationMs => clock.advance(durationMs),
);
