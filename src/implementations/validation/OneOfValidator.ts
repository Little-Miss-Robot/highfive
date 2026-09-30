import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export class OneOfValidator<const T extends readonly [unknown, ...unknown[]]> implements Validator<T[number]> {
    private readonly allowed: readonly unknown[];

    constructor(allowed: T) {
        if (allowed.length === 0) {
            throw new RangeError('OneOfValidator requires at least one value');
        }

        this.allowed = [...allowed];
    }

    public validate(value: unknown): T[number] {
        if (this.allowed.some(allowed => Object.is(allowed, value))) {
            return value as T[number];
        }

        throw new ValidationError([
            { path: [], message: this.failureMessage() },
        ]);
    }

    private failureMessage(): string {
        const described = this.allowed.map(describeValue);

        if (described.length === 1) {
            return `Expected ${described[0]}`;
        }

        return `Expected one of: ${described.join(', ')}`;
    }
}

function describeValue(value: unknown): string {
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }

    return String(value);
}
