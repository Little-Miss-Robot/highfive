import type { Validator } from '../../src/contracts/validation/Validator';
import { ValidationError } from '../../src/errors/ValidationError';
import { testValidatorContract } from '../../src/testsuite/validation/testValidatorContract';

interface User {
    name: string
}

class UserValidator implements Validator<User> {
    validate(value: unknown): User {
        if (
            typeof value === 'object'
            && value !== null
            && 'name' in value
            && typeof value.name === 'string'
            && value.name !== ''
        ) {
            return { name: value.name };
        }

        throw new ValidationError([
            {
                path: ['name'],
                message: 'Expected a non-empty string',
            },
        ]);
    }
}

testValidatorContract(
    'UserValidator',
    () => new UserValidator(),
    [
        { value: { name: 'Ada' }, expected: { name: 'Ada' } },
        { value: { name: 'Grace', extra: true }, expected: { name: 'Grace' } },
    ],
    [
        null,
        { name: '' },
        { name: 1 },
    ],
);
