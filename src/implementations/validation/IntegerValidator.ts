import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export interface IntegerValidatorOptions {
    readonly min?: number
    readonly max?: number
}

export class IntegerValidator implements Validator<number> {
    private readonly min: number | undefined;
    private readonly max: number | undefined;

    constructor(options: IntegerValidatorOptions = {}) {
        if (options.min !== undefined && !Number.isSafeInteger(options.min)) {
            throw new RangeError('min must be a safe integer');
        }

        if (options.max !== undefined && !Number.isSafeInteger(options.max)) {
            throw new RangeError('max must be a safe integer');
        }

        if (
            options.min !== undefined
            && options.max !== undefined
            && options.min > options.max
        ) {
            throw new RangeError('min must be less than or equal to max');
        }

        this.min = options.min;
        this.max = options.max;
    }

    public validate(value: unknown): number {
        if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected a safe integer' },
            ]);
        }

        if (this.min !== undefined && value < this.min) {
            throw new ValidationError([
                { path: [], message: `Expected an integer greater than or equal to ${this.min}` },
            ]);
        }

        if (this.max !== undefined && value > this.max) {
            throw new ValidationError([
                { path: [], message: `Expected an integer less than or equal to ${this.max}` },
            ]);
        }

        return value;
    }
}
