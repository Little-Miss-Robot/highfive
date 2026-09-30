import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { OptionalValidator } from '../../src/implementations/validation/OptionalValidator';
import { StringValidator } from '../../src/implementations/validation/StringValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'OptionalValidator',
    () => new OptionalValidator(new StringValidator({ nonEmpty: true })),
    [
        { value: undefined, expected: undefined },
        { value: 'Ada', expected: 'Ada' },
    ],
    [
        null,
        '',
        1,
    ],
);

describe('OptionalValidator', () => {
    it('keeps the inner issue when the value is present and rejected', () => {
        const validator = new OptionalValidator(new StringValidator({ nonEmpty: true }));

        expect(issues(() => validator.validate(''))).toEqual([
            { path: [], message: 'Expected a non-empty string' },
        ]);
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
