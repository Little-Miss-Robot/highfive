import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { URLValidator } from '../../src/implementations/validation/URLValidator';
import { testValidatorContract } from '../../src/testsuite';

testValidatorContract(
    'URLValidator',
    () => new URLValidator(),
    [
        { value: 'https://example.com', expected: 'https://example.com' },
        { value: 'https://example.com/a?b=1#c', expected: 'https://example.com/a?b=1#c' },
    ],
    [
        'example.com',
        '/relative',
        null,
    ],
);

describe('URLValidator', () => {
    it('returns the original string when it parses as an absolute URL', () => {
        const validator = new URLValidator();

        expect(validator.validate('mailto:ada@example.com')).toBe('mailto:ada@example.com');
        expect(issues(() => validator.validate('not a url'))).toEqual([
            { path: [], message: 'Expected a URL' },
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
