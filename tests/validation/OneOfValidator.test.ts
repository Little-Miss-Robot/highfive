import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { OneOfValidator } from '../../src/implementations/validation/OneOfValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'OneOfValidator',
    () => new OneOfValidator(['draft', 'published']),
    [
        { value: 'draft', expected: 'draft' },
        { value: 'published', expected: 'published' },
    ],
    [
        'archived',
        null,
        1,
    ],
);

describe('OneOfValidator', () => {
    it('compares values with Object.is and copies the allowed list', () => {
        const allowed = ['draft', 'published'];
        const validator = new OneOfValidator(allowed);

        allowed.push('archived');

        expect(validator.validate('draft')).toBe('draft');
        expect(issues(() => validator.validate('archived'))).toEqual([
            { path: [], message: 'Expected one of: "draft", "published"' },
        ]);
        expect(issues(() => new OneOfValidator([true]).validate(false))).toEqual([
            { path: [], message: 'Expected true' },
        ]);
    });

    it('requires at least one allowed value', () => {
        expect(() => new OneOfValidator([] as unknown as ['draft'])).toThrow(RangeError);
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
