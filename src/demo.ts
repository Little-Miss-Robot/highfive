import type { EventBus } from '@contracts/events/EventBus';
import type { Validator } from '@contracts/validation/Validator';
import { cached } from '@decorators/cache';
import { emit } from '@decorators/emit';
import { log } from '@decorators/log';
import { singleFlight } from '@decorators/singleFlight';
import { validate } from '@decorators/validate';
import { createFacades } from '@helpers/createFacades';
import { cacheProvider } from '@implementations/cache/provider';
import { clockProvider } from '@implementations/clock/provider';
import { DefaultContainer } from '@implementations/container/DefaultContainer';
import { InMemoryEventBus } from '@implementations/events/InMemoryEventBus';
import { executionProvider } from '@implementations/execution/provider';
import { httpProvider } from '@implementations/http/provider';
import { identifiersProvider } from '@implementations/identifiers/provider';
import { loggerProvider } from '@implementations/logger/provider';
import { serializerProvider } from '@implementations/serializer/provider';
import { DateValidator } from '@implementations/validation/DateValidator';
import { ObjectValidator } from '@implementations/validation/ObjectValidator';
import { StringValidator } from '@implementations/validation/StringValidator';
import { URLValidator } from '@implementations/validation/URLValidator';

// Simple domain model
interface Dadjoke {
    id: string
    joke: string
    received: Date
    extra: {
        url: string
    }
}

// Events
interface Events {
    received: Dadjoke
}

// Container & dependencies
const container = new DefaultContainer<{
    dadjokeEvents: () => EventBus<Events>
    jokeValidator: () => Validator<Dadjoke>
}>()
    .register(clockProvider)
    .register(httpProvider)
    .register(executionProvider)
    .register(identifiersProvider)
    .register(cacheProvider)
    .register(loggerProvider)
    .register(serializerProvider)
    .singleton('dadjokeEvents', () => new InMemoryEventBus())
    .singleton('jokeValidator', () => {
        return new ObjectValidator({
            id: new StringValidator({ nonEmpty: true }),
            joke: new StringValidator({ nonEmpty: true }),
            received: new DateValidator(),
            extra: new ObjectValidator({
                url: new URLValidator(),
            }),
        });
    })
;

// Basic facades
const { clock, http, logger, cache, dadjokeEvents, jokeValidator, deduplicator, idGenerator, serializer } = createFacades(container);

// Events
dadjokeEvents().on('received', (dadjoke) => {
    logger().info(`Dadjoke received with id ${dadjoke.id}`);
});

// Dadjoke service
class DadjokeService {
    @log(logger())
    @emit(dadjokeEvents(), 'received')
    @cached(cache(), 'dadjoke', 4000, { serializer: serializer() })
    @validate(jokeValidator())
    @singleFlight(deduplicator(), idGenerator())
    static async get(): Promise<Dadjoke> {
        const response = await http().get('https://icanhazdadjoke.com/', {
            headers: {
                Accept: 'application/json',
            },
        });

        const json = await response.json();

        json.received = clock().now();
        json.extra = {};
        json.extra.url = 'http://www.littlemissrobot.be';

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

jokes.forEach((joke) => {
    const serializedJoke = serializer().serialize(joke);
    logger().info(`Serialized joke: ${serializedJoke}`);
    const deserializedJoke = serializer().deserialize(serializedJoke);
    const dadjoke = jokeValidator().validate(deserializedJoke);

    console.log(dadjoke.received?.getFullYear());
    console.log(dadjoke.extra.url);
});
