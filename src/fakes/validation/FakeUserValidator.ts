import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export interface FakeUser {
    name: string
    age: number
    isAdmin?: boolean
}

function isUser(value: unknown): value is FakeUser {
    return typeof value === 'object'
        && value !== null
        && 'name' in value
        && 'age' in value
        && typeof value.name === 'string'
        && typeof value.age === 'number'
        && (!('isAdmin' in value) || typeof value.isAdmin === 'boolean');
}

export class FakeUserValidator implements Validator<FakeUser> {
    validate(value: unknown): FakeUser {
        if (!isUser(value)) {
            throw new ValidationError([
                {
                    path: [],
                    message: 'Value is not a user',
                },
            ]);
        }

        return value;
    }
}
