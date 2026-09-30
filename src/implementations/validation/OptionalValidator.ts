import type { Validator } from '@contracts/validation/Validator';

export class OptionalValidator<T> implements Validator<T | undefined> {
    constructor(private readonly validator: Validator<T>) {}

    public validate(value: unknown): T | undefined {
        if (value === undefined) {
            return undefined;
        }

        return this.validator.validate(value);
    }
}
