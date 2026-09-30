import type { ValidationIssue } from '@contracts/validation/ValidationIssue';
import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export class ArrayValidator<T> implements Validator<T[]> {
    constructor(private readonly item: Validator<T>) {}

    public validate(value: unknown): T[] {
        if (!Array.isArray(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected an array' },
            ]);
        }

        const issues: ValidationIssue[] = [];
        const result: T[] = [];

        for (let index = 0; index < value.length; index++) {
            try {
                result.push(this.item.validate(value[index]));
            }
            catch (error) {
                if (!(error instanceof ValidationError)) {
                    throw error;
                }

                issues.push(...prefixIssues(index, error));
            }
        }

        if (issues.length > 0) {
            throw new ValidationError(issues);
        }

        return result;
    }
}

function prefixIssues(index: number, error: ValidationError): ValidationIssue[] {
    return error.issues.map(issue => ({
        path: [index, ...issue.path],
        message: issue.message,
    }));
}
