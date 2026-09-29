import type { ValidationIssue } from '@contracts/validation/ValidationIssue';
import type { Validator } from '@contracts/validation/Validator';
import { describe, expect, it } from 'vitest';

interface AcceptedValidation<T> {
    readonly value: unknown
    readonly expected: T
}

function expectValidationFailure(error: unknown): void {
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({ name: 'ValidationError' });

    const issues = (error as { issues?: unknown }).issues;

    expect(Array.isArray(issues)).toBe(true);

    if (!Array.isArray(issues)) {
        return;
    }

    expect(issues.length).toBeGreaterThan(0);

    for (const issue of issues) {
        expect(issue).toEqual(expect.objectContaining({
            path: expect.any(Array),
            message: expect.any(String),
        }));

        const { path, message } = issue as ValidationIssue;

        expect(message.length).toBeGreaterThan(0);

        for (const segment of path) {
            expect(['string', 'number']).toContain(typeof segment);
        }
    }
}

function expectRejected(validate: () => unknown): void {
    try {
        validate();
    }
    catch (error) {
        expectValidationFailure(error);
        return;
    }

    expect.fail('validate should throw');
}

export function testValidatorContract<T>(
    name: string,
    createValidator: () => Validator<T>,
    accepted: readonly AcceptedValidation<T>[],
    rejected: readonly unknown[],
): void {
    describe(`${name}: Validator contract`, () => {
        it('returns the expected value for every accepted input', () => {
            const validator = createValidator();

            expect(accepted.length).toBeGreaterThan(0);

            for (const example of accepted) {
                expect(validator.validate(example.value)).toEqual(example.expected);
                expect(validator.validate(example.value)).toEqual(example.expected);
            }
        });

        it('throws ValidationError for every rejected input', () => {
            const validator = createValidator();

            expect(rejected.length).toBeGreaterThan(0);

            for (const value of rejected) {
                expectRejected(() => validator.validate(value));
                expectRejected(() => validator.validate(value));
            }
        });
    });
}
