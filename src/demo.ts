import type { EventBus } from '@contracts/events/EventBus';
import type { Validator } from '@contracts/validation/Validator';
import { cached } from '@decorators/cache';
import { emit } from '@decorators/emit';
import { log } from '@decorators/log';
import { singleFlight } from '@decorators/singleFlight';
import { validate } from '@decorators/validate';
import { ValidationError } from '@errors/ValidationError';
import { createFacades } from '@helpers/createFacades';
import { cacheProvider } from '@implementations/cache/provider';
import { clockProvider } from '@implementations/clock/provider';
import { DefaultContainer } from '@implementations/container/DefaultContainer';
import { InMemoryEventBus } from '@implementations/events/InMemoryEventBus';
import { executionProvider } from '@implementations/execution/provider';
import { httpProvider } from '@implementations/http/provider';
import { identifiersProvider } from '@implementations/identifiers/provider';
import { loggerProvider } from '@implementations/logger/provider';

// Simple domain model
interface Dadjoke {
    id: string
    joke: string
}

// Type guard
function isDadjoke(value: unknown): value is Dadjoke {
    return (
        typeof value === 'object'
        && value !== null
        && 'id' in value
        && typeof value.id === 'string'
        && 'joke' in value
        && typeof value.joke === 'string'
    );
}

// Simple validator
const validator: Validator<Dadjoke> = {
    validate(value: unknown): Dadjoke {
        if (!isDadjoke(value)) {
            throw new ValidationError([
                {
                    path: [],
                    message: 'Value is no dadjoke',
                },
            ]);
        }

        return value;
    },
};

// Events
interface Events {
    received: Dadjoke
}

// Container & dependencies
const container = new DefaultContainer<{
    dadjokeEvents: () => EventBus<Events>
}>()
    .register(clockProvider)
    .register(httpProvider)
    .register(executionProvider)
    .register(identifiersProvider)
    .register(cacheProvider)
    .register(loggerProvider)
    .singleton('dadjokeEvents', () => new InMemoryEventBus())
;

// Basic facades
const { http, logger, cache, dadjokeEvents, deduplicator, idGenerator } = createFacades(container);

// Events
dadjokeEvents().on('received', (dadjoke) => {
    logger().info(`Dadjoke received with id ${dadjoke.id}`);
});

// Dadjoke service
class DadjokeService {
    @log(logger())
    @emit(dadjokeEvents(), 'received')
    @cached(cache(), 'dadjoke', 4000)
    @validate(validator)
    @singleFlight(deduplicator(), idGenerator())
    static async get(): Promise<Dadjoke> {
        const response = await http().get('https://icanhazdadjoke.com/', {
            headers: {
                Accept: 'application/json',
            },
        });

        const json = await response.json();

        return json;
    }
}

const jokes = await Promise.all([
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
]);

const jokes2 = await Promise.all([
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
    DadjokeService.get(),
]);

console.log(jokes);
console.log(jokes2);
