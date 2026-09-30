import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export interface NumberValidatorOptions {
    readonly min?: number
    readonly max?: number
}

export class NumberValidator implements Validator<number> {
    private readonly min: number | undefined;
    private readonly max: number | undefined;

    constructor(options: NumberValidatorOptions = {}) {
        if (options.min !== undefined && !Number.isFinite(options.min)) {
            throw new RangeError('min must be a finite number');
        }

        if (options.max !== undefined && !Number.isFinite(options.max)) {
            throw new RangeError('max must be a finite number');
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
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected a finite number' },
            ]);
        }

        if (this.min !== undefined && value < this.min) {
            throw new ValidationError([
                { path: [], message: `Expected a number greater than or equal to ${this.min}` },
            ]);
        }

        if (this.max !== undefined && value > this.max) {
            throw new ValidationError([
                { path: [], message: `Expected a number less than or equal to ${this.max}` },
            ]);
        }

        return value;
    }
}
