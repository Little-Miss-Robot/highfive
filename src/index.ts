import cache from './decorators/cache';
import emit from './decorators/emit';
import log from './decorators/log';
import trace from './decorators/trace';
import events from './facades/events';
import http from './facades/http';
import logger from './facades/logger';

events().on('received', e => logger().info(e));

class DadjokeService {
    @trace('Get dadjoke')
    @log()
    @emit(events(), 'received')
    @cache('dadjoke', 60_000)
    static async get(): Promise<string> {
        const response = await http().get('https://icanhazdadjoke.com', {
            headers: {
                Accept: 'application/json',
            },
        });

        return await response.text();
    }
}

function wait(durationMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

async function test() {
    const joke1 = await DadjokeService.get();
    await wait(5000);
    const joke10 = await DadjokeService.get();

    console.log(joke1, joke10);
}

void test();
