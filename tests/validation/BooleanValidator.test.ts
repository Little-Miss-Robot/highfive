import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { BooleanValidator } from '../../src/implementations/validation/BooleanValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'BooleanValidator',
    () => new BooleanValidator(),
    [
        { value: true, expected: true },
        { value: false, expected: false },
    ],
    [
        0,
        'true',
        null,
    ],
);

describe('BooleanValidator', () => {
    it('describes a rejected value as a boolean', () => {
        expect(issues(() => new BooleanValidator().validate('true'))).toEqual([
            { path: [], message: 'Expected a boolean' },
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
