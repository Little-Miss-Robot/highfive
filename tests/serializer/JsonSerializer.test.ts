import type { FakeUser } from '../../src/fakes/validation/FakeUserValidator';
import { FakeUserValidator } from '../../src/fakes/validation/FakeUserValidator';
import { JsonSerializer } from '../../src/implementations/serializer/JsonSerializer';
import { testSerializerContract } from '../../src/testsuite';

const fakeUserValidator = new FakeUserValidator();

testSerializerContract<FakeUser>(
    'JsonSerializer',
    () => new JsonSerializer(fakeUserValidator.validate),
    [
        { name: 'John', age: 26, isAdmin: false },
        { name: 'Alice', age: 39 },
        { name: 'Burt', age: 34, isAdmin: true },
        { name: 'Raymond', age: 42 },
        { name: 'Billy', age: 36 },
    ],
);
