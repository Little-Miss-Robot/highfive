import type { Clock } from '../../src/clock/Clock';
import { MemoryCache } from '../../src/cache/MemoryCache';
import { testCacheContract } from '../../src/testsuite/cache/testCacheContract';

class TestClock implements Clock {
    private timestampMs = 0;

    now(): Date {
        return new Date(this.timestampMs);
    }

    advance(durationMs: number): void {
        this.timestampMs += durationMs;
    }
}

const clock = new TestClock();

testCacheContract(
    'MemoryCache',
    () => new MemoryCache(clock),
    durationMs => clock.advance(durationMs),
);
