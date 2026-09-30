import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export class BooleanValidator implements Validator<boolean> {
    public validate(value: unknown): boolean {
        if (typeof value !== 'boolean') {
            throw new ValidationError([
                { path: [], message: 'Expected a boolean' },
            ]);
        }

        return value;
    }
}
