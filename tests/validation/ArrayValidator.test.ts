import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { ArrayValidator } from '../../src/implementations/validation/ArrayValidator';
import { DateValidator } from '../../src/implementations/validation/DateValidator';
import { StringValidator } from '../../src/implementations/validation/StringValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'ArrayValidator',
    () => new ArrayValidator(new StringValidator()),
    [
        { value: [], expected: [] },
        { value: ['Ada', 'Grace'], expected: ['Ada', 'Grace'] },
    ],
    [
        null,
        'Ada',
        {},
    ],
);

describe('ArrayValidator', () => {
    it('prefixes each item issue with its index and keeps going', () => {
        const validator = new ArrayValidator(new StringValidator({ nonEmpty: true }));

        expect(issues(() => validator.validate(['Ada', '', 1]))).toEqual([
            { path: [1], message: 'Expected a non-empty string' },
            { path: [2], message: 'Expected a string' },
        ]);
    });

    it('returns the values produced by the item validator', () => {
        const validator = new ArrayValidator(new DateValidator());
        const result = validator.validate(['2020-01-02']);

        expect(result).toEqual([new Date('2020-01-02T00:00:00.000Z')]);
    });

    it('describes a non-array as an array', () => {
        expect(issues(() => new ArrayValidator(new StringValidator()).validate({}))).toEqual([
            { path: [], message: 'Expected an array' },
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
