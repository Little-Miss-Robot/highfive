import { JsonSerializer } from '../../src/implementations/serializer/JsonSerializer';
import { testSerializerContract } from '../../src/testsuite';

interface User {
    name: string
    age: number
    isAdmin?: boolean
}

function isUser(value: unknown): value is User {
    return typeof value === 'object'
        && value !== null
        && 'name' in value
        && 'age' in value
        && typeof value.name === 'string'
        && typeof value.age === 'number'
        && (!('isAdmin' in value) || typeof value.isAdmin === 'boolean');
}

testSerializerContract<User>(
    'JsonSerializer',
    () => new JsonSerializer((value) => {
        if (!isUser(value)) {
            throw new TypeError('Expected a user');
        }
        return value;
    }),
    [
        { name: 'Rein', age: 36 },
        { name: 'John', age: 26, isAdmin: false },
        { name: 'Alice', age: 39 },
        { name: 'Burt', age: 34, isAdmin: true },
        { name: 'Raymond', age: 42 },
        { name: 'Raymond', age: 42 },
    ],
);
