import type { Clock } from './Clock';

export default class CurrentTimeClock implements Clock {
    now(): Date {
        return new Date();
    }
}
