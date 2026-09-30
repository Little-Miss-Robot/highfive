import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const dateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/;

export class DateValidator implements Validator<Date> {
    public validate(value: unknown): Date {
        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) {
                throw invalidDate();
            }

            return new Date(value.getTime());
        }

        if (typeof value === 'string') {
            const parsed = parseIso8601(value);

            if (parsed !== undefined) {
                return parsed;
            }
        }

        throw invalidDate();
    }
}

function invalidDate(): ValidationError {
    return new ValidationError([
        { path: [], message: 'Expected a Date or an ISO 8601 date' },
    ]);
}

function parseIso8601(value: string): Date | undefined {
    const dateOnly = dateOnlyPattern.exec(value);

    if (dateOnly) {
        const year = Number(dateOnly[1]);
        const month = Number(dateOnly[2]);
        const day = Number(dateOnly[3]);

        if (!isCalendarDate(year, month, day)) {
            return undefined;
        }

        return new Date(Date.UTC(year, month - 1, day));
    }

    const dateTime = dateTimePattern.exec(value);

    if (!dateTime) {
        return undefined;
    }

    const year = Number(dateTime[1]);
    const month = Number(dateTime[2]);
    const day = Number(dateTime[3]);
    const hour = Number(dateTime[4]);
    const minute = Number(dateTime[5]);
    const second = Number(dateTime[6]);
    const offset = dateTime[7];

    if (
        !isCalendarDate(year, month, day)
        || hour > 23
        || minute > 59
        || second > 59
    ) {
        return undefined;
    }

    if (offset !== 'Z') {
        const offsetHour = Number(dateTime[8]);
        const offsetMinute = Number(dateTime[9]);

        if (offsetHour > 23 || offsetMinute > 59) {
            return undefined;
        }
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed;
}

function isCalendarDate(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12 || day < 1) {
        return false;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
}
