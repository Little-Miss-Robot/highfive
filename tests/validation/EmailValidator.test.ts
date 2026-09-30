import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { EmailValidator } from '../../src/implementations/validation/EmailValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'EmailValidator',
    () => new EmailValidator(),
    [
        { value: 'ada@example.com', expected: 'ada@example.com' },
        { value: 'a.b+tag@example.co.uk', expected: 'a.b+tag@example.co.uk' },
    ],
    [
        'ada',
        'ada@example',
        'ada@example..com',
    ],
);

describe('EmailValidator', () => {
    it('accepts a typical address and returns it unchanged', () => {
        expect(new EmailValidator().validate('Ada@Example.com')).toBe('Ada@Example.com');
    });

    it('rejects addresses that are not a local part plus a dotted domain', () => {
        const validator = new EmailValidator();
        const rejected = [
            'ada@',
            '@example.com',
            'ada@@example.com',
            'ada @example.com',
            '.ada@example.com',
            'ada.@example.com',
            'ada..lovelace@example.com',
            'ada@-example.com',
            'ada@example.c',
            'ada@example.com.',
            1,
        ];

        for (const value of rejected) {
            expect(issues(() => validator.validate(value))).toEqual([
                { path: [], message: 'Expected an email address' },
            ]);
        }
    });

    it('rejects a local part longer than 64 characters', () => {
        const local = 'a'.repeat(65);

        expect(issues(() => new EmailValidator().validate(`${local}@example.com`))).toEqual([
            { path: [], message: 'Expected an email address' },
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
