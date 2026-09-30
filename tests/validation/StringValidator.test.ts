import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { StringValidator } from '../../src/implementations/validation/StringValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'StringValidator',
    () => new StringValidator(),
    [
        { value: '', expected: '' },
        { value: 'Ada', expected: 'Ada' },
    ],
    [
        null,
        1,
        undefined,
    ],
);

describe('StringValidator', () => {
    it('rejects a non-string with a string message', () => {
        expect(issues(() => new StringValidator().validate(1))).toEqual([
            { path: [], message: 'Expected a string' },
        ]);
    });

    it('counts UTF-16 code units', () => {
        const validator = new StringValidator({ maxLength: 1 });

        expect(validator.validate('é')).toBe('é');
        expect(issues(() => validator.validate('👍'))).toEqual([
            { path: [], message: 'Expected a string with at most 1 character' },
        ]);
    });

    it('rejects an empty string when nonEmpty is set', () => {
        const validator = new StringValidator({ nonEmpty: true });

        expect(validator.validate(' ')).toBe(' ');
        expect(issues(() => validator.validate(''))).toEqual([
            { path: [], message: 'Expected a non-empty string' },
        ]);
    });

    it('enforces inclusive length bounds', () => {
        const validator = new StringValidator({ minLength: 2, maxLength: 4 });

        expect(validator.validate('Ada')).toBe('Ada');
        expect(issues(() => validator.validate('A'))).toEqual([
            { path: [], message: 'Expected a string with at least 2 characters' },
        ]);
        expect(issues(() => validator.validate('Grace'))).toEqual([
            { path: [], message: 'Expected a string with at most 4 characters' },
        ]);
    });

    it('uses the non-empty message when the effective minimum is 1', () => {
        expect(issues(() => new StringValidator({ nonEmpty: true, minLength: 1 }).validate(''))).toEqual([
            { path: [], message: 'Expected a non-empty string' },
        ]);
        expect(issues(() => new StringValidator({ nonEmpty: true, minLength: 3 }).validate(''))).toEqual([
            { path: [], message: 'Expected a string with at least 3 characters' },
        ]);
    });

    it('rejects bounds that cannot be satisfied', () => {
        expect(() => new StringValidator({ minLength: -1 })).toThrow(RangeError);
        expect(() => new StringValidator({ minLength: 1.5 })).toThrow(RangeError);
        expect(() => new StringValidator({ maxLength: -1 })).toThrow(RangeError);
        expect(() => new StringValidator({ minLength: 3, maxLength: 2 })).toThrow(RangeError);
        expect(() => new StringValidator({ nonEmpty: true, maxLength: 0 })).toThrow(RangeError);
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
