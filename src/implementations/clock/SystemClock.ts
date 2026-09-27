import type { Clock } from '@contracts/clock/Clock';

export default class SystemClock implements Clock {
    now(): Date {
        return new Date();
    }
}
