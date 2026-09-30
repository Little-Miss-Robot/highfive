import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { NumberValidator } from '../../src/implementations/validation/NumberValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'NumberValidator',
    () => new NumberValidator(),
    [
        { value: 0, expected: 0 },
        { value: -1.5, expected: -1.5 },
    ],
    [
        Number.NaN,
        Number.POSITIVE_INFINITY,
        '1',
    ],
);

describe('NumberValidator', () => {
    it('enforces inclusive bounds', () => {
        const validator = new NumberValidator({ min: 0, max: 10 });

        expect(validator.validate(0)).toBe(0);
        expect(validator.validate(10)).toBe(10);
        expect(issues(() => validator.validate(-0.1))).toEqual([
            { path: [], message: 'Expected a number greater than or equal to 0' },
        ]);
        expect(issues(() => validator.validate(10.1))).toEqual([
            { path: [], message: 'Expected a number less than or equal to 10' },
        ]);
    });

    it('rejects a non-finite value before checking bounds', () => {
        expect(issues(() => new NumberValidator({ min: 0 }).validate(Number.NaN))).toEqual([
            { path: [], message: 'Expected a finite number' },
        ]);
    });

    it('rejects bounds that are not finite or are reversed', () => {
        expect(() => new NumberValidator({ min: Number.NaN })).toThrow(RangeError);
        expect(() => new NumberValidator({ max: Number.POSITIVE_INFINITY })).toThrow(RangeError);
        expect(() => new NumberValidator({ min: 2, max: 1 })).toThrow(RangeError);
    });
});

function issues(validate: () => unknown) {
    try {
        validate();
    }
    catch (error) {
        expect(error).toBeInstanceOf(ValidationError);

        return (error as ValidationError).issues;
    }

    expect.fail('validate should throw');
}
