import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { ArrayValidator } from '../../src/implementations/validation/ArrayValidator';
import { EmailValidator } from '../../src/implementations/validation/EmailValidator';
import { ObjectValidator } from '../../src/implementations/validation/ObjectValidator';
import { OptionalValidator } from '../../src/implementations/validation/OptionalValidator';
import { StringValidator } from '../../src/implementations/validation/StringValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'ObjectValidator',
    () => new ObjectValidator({
        name: new StringValidator({ nonEmpty: true }),
    }),
    [
        { value: { name: 'Ada' }, expected: { name: 'Ada' } },
        { value: { name: 'Grace', extra: true }, expected: { name: 'Grace' } },
    ],
    [
        null,
        [],
        { name: '' },
    ],
);

describe('ObjectValidator', () => {
    const validator = new ObjectValidator({
        name: new StringValidator({ nonEmpty: true }),
        email: new EmailValidator(),
        nickname: new OptionalValidator(new StringValidator()),
        tags: new ArrayValidator(new StringValidator({ nonEmpty: true })),
    });

    it('passes missing fields as undefined and omits unknown fields', () => {
        expect(validator.validate({
            name: 'Ada',
            email: 'ada@example.com',
            tags: ['math'],
            extra: true,
        })).toEqual({
            name: 'Ada',
            email: 'ada@example.com',
            nickname: undefined,
            tags: ['math'],
        });
    });

    it('collects field issues and prefixes nested paths', () => {
        expect(issues(() => validator.validate({
            name: '',
            email: 'ada',
            tags: ['ok', ''],
        }))).toEqual([
            { path: ['name'], message: 'Expected a non-empty string' },
            { path: ['email'], message: 'Expected an email address' },
            { path: ['tags', 1], message: 'Expected a non-empty string' },
        ]);
    });

    it('describes a non-object as an object', () => {
        expect(issues(() => validator.validate([]))).toEqual([
            { path: [], message: 'Expected an object' },
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
