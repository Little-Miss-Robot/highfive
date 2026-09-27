import type { Clock } from '@contracts/clock/Clock';

export class SystemClock implements Clock {
    now(): Date {
        return new Date();
    }
}
