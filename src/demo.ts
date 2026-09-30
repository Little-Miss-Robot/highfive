import type { EventBus } from '@contracts/events/EventBus';
import type { Transformer } from '@contracts/transformer/Transformer';
import type { Validator } from '@contracts/validation/Validator';
import * as events from "node:events";
import { cached } from '@decorators/cache';
import { emit } from '@decorators/emit';
import { log } from '@decorators/log';
import { singleFlight } from '@decorators/singleFlight';
import { createFacades } from '@helpers/createFacades';
import { createFlow } from '@helpers/createFlow';
import { withEmit } from '@helpers/withEmit';
import { withRetry } from '@helpers/withRetry';
import { withTransform } from '@helpers/withTransform';
import { withValidate } from '@helpers/withValidate';
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
import { NumberValidator } from '@implementations/validation/NumberValidator';
import { ObjectValidator } from '@implementations/validation/ObjectValidator';
import { StringValidator } from '@implementations/validation/StringValidator';
import { URLValidator } from '@implementations/validation/URLValidator';

interface Events {
    received: Dadjoke
}

interface ApiDadjoke {
    id: string
    joke: string
    status: number
}

interface Dadjoke {
    id: string
    joke: string
    received: Date
    extra: {
        url: string
    }
}

// Container & dependencies
const container = new DefaultContainer<{
    events: () => EventBus<Events>
}>()
    .register(clockProvider)
    .register(httpProvider)
    .register(executionProvider)
    .register(identifiersProvider)
    .register(cacheProvider)
    .register(loggerProvider)
    .register(serializerProvider)
    .singleton('events', () => new InMemoryEventBus())
;

const { clock, http, logger, cache, events, deduplicator, idGenerator, serializer, retryPolicy } = createFacades(container);

// Events
events().on('received', (dadjoke) => {
    logger().info(`Dadjoke received with id ${dadjoke.id}`);
});

const apiDadjokeValidator: Validator<ApiDadjoke> = new ObjectValidator({
    id: new StringValidator({ nonEmpty: true }),
    joke: new StringValidator({ nonEmpty: true }),
    status: new NumberValidator(),
});

const dadjokeValidator: Validator<Dadjoke> = new ObjectValidator({
    id: new StringValidator({ nonEmpty: true }),
    joke: new StringValidator({ nonEmpty: true }),
    received: new DateValidator(),
    extra: new ObjectValidator({
        url: new URLValidator(),
    }),
});

const toDadjoke: Transformer<ApiDadjoke, Dadjoke> = {
    transform(apiDadjoke) {
        return {
            id: apiDadjoke.id,
            joke: apiDadjoke.joke,
            received: clock().now(),
            extra: {
                url: `https://icanhazdadjoke.com/j/${apiDadjoke.id}`,
            },
        };
    },
};

class DadjokeService {
    @log(logger())
    @emit(events(), 'received')
    @cached(cache(), 'dadjoke', 4000, { serializer: serializer() })
    @singleFlight(deduplicator(), idGenerator())
    static async get(): Promise<Dadjoke> {
        const response = await http().get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' },
        });

        return toDadjoke.transform(
            apiDadjokeValidator.validate(
                await response.json(),
            ),
        );
    }
}

const dadjokeApiService = {
    get: createFlow(async () => {
        const response = await http().get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' },
        });

        return response.json();
    })
        .use(withRetry(retryPolicy()))
        .use(withValidate(apiDadjokeValidator))
        .use(withTransform(toDadjoke))
        .use(withEmit(events(), 'received')),
};

const response = await dadjokeApiService.get();
console.log(response);

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

console.log(jokes);

jokes.forEach((joke) => {
    const serializedJoke = serializer().serialize(joke);
    logger().info(`Serialized joke: ${serializedJoke}`);
    const deserializedJoke = serializer().deserialize(serializedJoke);
    const dadjoke = dadjokeValidator.validate(deserializedJoke);

    console.log(dadjoke.received?.getFullYear());
    console.log(dadjoke.extra.url);
    console.log(dadjoke);
});
