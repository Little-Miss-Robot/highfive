import type { Clock } from '@contracts/clock/Clock';

export default class AdvanceableClock implements Clock {
    private timestampMs = 0;

    now(): Date {
        return new Date(this.timestampMs);
    }

    advance(durationMs: number): void {
        this.timestampMs += durationMs;
    }
}
