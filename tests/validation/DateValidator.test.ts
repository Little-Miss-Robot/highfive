import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { DateValidator } from '../../src/implementations/validation/DateValidator';
import { testValidatorContract } from '../../src/testsuite';

const joined = new Date('2020-01-02T03:04:05.000Z');

testValidatorContract(
    'DateValidator',
    () => new DateValidator(),
    [
        { value: joined, expected: joined },
        { value: '2020-01-02', expected: new Date('2020-01-02T00:00:00.000Z') },
        { value: '2020-01-02T03:04:05Z', expected: new Date('2020-01-02T03:04:05.000Z') },
    ],
    [
        new Date(Number.NaN),
        '2020-02-31',
        '2020-01-02T03:04:05',
        0,
    ],
);

describe('DateValidator', () => {
    it('returns a copy of a valid Date', () => {
        const validator = new DateValidator();
        const result = validator.validate(joined);

        expect(result).not.toBe(joined);
        expect(result.toISOString()).toBe(joined.toISOString());
    });

    it('parses a date-time with an offset and fractional seconds', () => {
        const validator = new DateValidator();

        expect(validator.validate('2020-01-02T03:04:05+02:00').toISOString()).toBe('2020-01-02T01:04:05.000Z');
        expect(validator.validate('2020-02-29T00:00:00.1Z').toISOString()).toBe('2020-02-29T00:00:00.100Z');
    });

    it('rejects calendar dates and times that are not ISO 8601 instants', () => {
        const validator = new DateValidator();
        const rejected = [
            '2019-02-29',
            '2020-13-01',
            '2020-01-02T24:00:00Z',
            '2020-01-02t03:04:05Z',
            '2020-01-02T03:04:05+24:00',
            'yesterday',
        ];

        for (const value of rejected) {
            expect(issues(() => validator.validate(value))).toEqual([
                { path: [], message: 'Expected a Date or an ISO 8601 date' },
            ]);
        }
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
