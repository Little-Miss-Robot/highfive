import type { EventBus } from '@contracts/events/EventBus';
import { cached } from '@decorators/cache';
import { emit } from '@decorators/emit';

import {
    analyticsProvider,
    cacheProvider,
    clockProvider,
    DefaultContainer,
    diagnosticsProvider,
    executionProvider,
    httpProvider,
    identifiersProvider,
    InMemoryEventBus,
    loggerProvider,
} from '@implementations/index';

export interface AppEvents {
    received: string
}

const container = new DefaultContainer<{
    events: () => EventBus<AppEvents>
}>()
    .register(identifiersProvider)
    .register(clockProvider)
    .register(loggerProvider)
    .register(diagnosticsProvider)
    .register(executionProvider)
    .register(cacheProvider)
    .register(httpProvider)
    .register(analyticsProvider)
    .singleton('events', () => new InMemoryEventBus<AppEvents>());

container.make('logger').info('Hello?');

class DadJokeService {
    @emit(container.make('events'), 'received')
    @cached(container.make('cache'), 'dadjoke', 1000)
    static async get(): Promise<string> {
        const response = await container.make('http').get('https://icanhazdadjoke.com/', {
            headers: {
                Accept: 'application/json',
            },
        });

        try {
            const json = await response.json();

            return json.joke;
        }
        catch {
            //
        }

        return 'No joke...';
    }
}

container.make('events').on('received', (e) => {
    container.make('logger').info(e);
});

await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
await DadJokeService.get();
