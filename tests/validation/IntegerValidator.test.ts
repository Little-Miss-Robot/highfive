import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { IntegerValidator } from '../../src/implementations/validation/IntegerValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'IntegerValidator',
    () => new IntegerValidator(),
    [
        { value: 0, expected: 0 },
        { value: Number.MAX_SAFE_INTEGER, expected: Number.MAX_SAFE_INTEGER },
    ],
    [
        1.5,
        Number.MAX_SAFE_INTEGER + 1,
        '1',
    ],
);

describe('IntegerValidator', () => {
    it('enforces inclusive bounds', () => {
        const validator = new IntegerValidator({ min: 1, max: 3 });

        expect(validator.validate(1)).toBe(1);
        expect(validator.validate(3)).toBe(3);
        expect(issues(() => validator.validate(0))).toEqual([
            { path: [], message: 'Expected an integer greater than or equal to 1' },
        ]);
        expect(issues(() => validator.validate(4))).toEqual([
            { path: [], message: 'Expected an integer less than or equal to 3' },
        ]);
    });

    it('rejects a non-integer before checking bounds', () => {
        expect(issues(() => new IntegerValidator({ min: 0 }).validate(1.5))).toEqual([
            { path: [], message: 'Expected a safe integer' },
        ]);
    });

    it('rejects bounds that are not safe integers or are reversed', () => {
        expect(() => new IntegerValidator({ min: 1.5 })).toThrow(RangeError);
        expect(() => new IntegerValidator({ max: Number.NaN })).toThrow(RangeError);
        expect(() => new IntegerValidator({ min: 3, max: 1 })).toThrow(RangeError);
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
