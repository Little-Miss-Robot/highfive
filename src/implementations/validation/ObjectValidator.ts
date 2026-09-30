import type { ValidationIssue } from '@contracts/validation/ValidationIssue';
import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

type ValidatedValue<V> = V extends Validator<infer T> ? T : never;

type ValidatedObject<Fields extends Record<string, Validator<unknown>>> = {
    [Key in keyof Fields]: ValidatedValue<Fields[Key]>
};

export class ObjectValidator<Fields extends Record<string, Validator<unknown>>> implements Validator<ValidatedObject<Fields>> {
    constructor(private readonly fields: Fields) {}

    public validate(value: unknown): ValidatedObject<Fields> {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected an object' },
            ]);
        }

        const input = value as Record<string, unknown>;
        const issues: ValidationIssue[] = [];
        const result = {} as ValidatedObject<Fields>;

        for (const key of Object.keys(this.fields)) {
            const fieldValue = Object.prototype.hasOwnProperty.call(input, key)
                ? input[key]
                : undefined;

            try {
                result[key as keyof Fields] = this.fields[key].validate(fieldValue) as ValidatedObject<Fields>[keyof Fields];
            }
            catch (error) {
                if (!(error instanceof ValidationError)) {
                    throw error;
                }

                issues.push(...prefixIssues(key, error));
            }
        }

        if (issues.length > 0) {
            throw new ValidationError(issues);
        }

        return result;
    }
}

function prefixIssues(key: string, error: ValidationError): ValidationIssue[] {
    return error.issues.map(issue => ({
        path: [key, ...issue.path],
        message: issue.message,
    }));
}
