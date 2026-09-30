import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export interface StringValidatorOptions {
    readonly minLength?: number
    readonly maxLength?: number
    readonly nonEmpty?: boolean
}

export class StringValidator implements Validator<string> {
    private readonly minLength: number | undefined;
    private readonly maxLength: number | undefined;
    private readonly nonEmpty: boolean;

    constructor(options: StringValidatorOptions = {}) {
        const { minLength, maxLength, nonEmpty = false } = options;

        if (minLength !== undefined && (!Number.isSafeInteger(minLength) || minLength < 0)) {
            throw new RangeError('minLength must be a non-negative integer');
        }

        if (maxLength !== undefined && (!Number.isSafeInteger(maxLength) || maxLength < 0)) {
            throw new RangeError('maxLength must be a non-negative integer');
        }

        const minimum = nonEmpty ? Math.max(minLength ?? 0, 1) : minLength;

        if (minimum !== undefined && maxLength !== undefined && minimum > maxLength) {
            throw new RangeError('minLength must be less than or equal to maxLength');
        }

        this.minLength = minimum;
        this.maxLength = maxLength;
        this.nonEmpty = nonEmpty;
    }

    public validate(value: unknown): string {
        if (typeof value !== 'string') {
            throw new ValidationError([
                { path: [], message: 'Expected a string' },
            ]);
        }

        if (this.minLength !== undefined && value.length < this.minLength) {
            throw new ValidationError([
                { path: [], message: this.tooShortMessage() },
            ]);
        }

        if (this.maxLength !== undefined && value.length > this.maxLength) {
            const unit = this.maxLength === 1 ? 'character' : 'characters';

            throw new ValidationError([
                { path: [], message: `Expected a string with at most ${this.maxLength} ${unit}` },
            ]);
        }

        return value;
    }

    private tooShortMessage(): string {
        if (this.nonEmpty && this.minLength === 1) {
            return 'Expected a non-empty string';
        }

        const minimum = this.minLength ?? 0;
        const unit = minimum === 1 ? 'character' : 'characters';

        return `Expected a string with at least ${minimum} ${unit}`;
    }
}
