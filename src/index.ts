import container from './container';
import timeout from './decorators/timeout';

container.make('http').say('Nice!');

container.make('analytics').track('page_view', {
    id: container.make('idGenerator').generate(),
});

container.bind('idGenerator', () => {
    return {
        generate(): string {
            return `${Math.random()}`;
        },
    };
});

container.make('logger').info(
    container.make('idGenerator').generate(),
);

container.make('logger').info(
    container.make('idGenerator').generate(),
);

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

class TourService {
    calls = 0;

    @timeout(5_000)
    async getTour(id: string): Promise<string> {
        this.calls++;
        await wait(50000);
        return `Tour ${id}`;
    }
}

async function test() {
    const service = new TourService();

    const [first, second] = await Promise.all([
        service.getTour('123'),
        service.getTour('123'),
    ]);

    console.log(first, second); // Tour 123, Tour 123
    console.log(service.calls); // 1: concurrent calls shared the work

    await service.getTour('123');
    console.log(service.calls); // 2: completed work isn't cached

    await Promise.all([
        service.getTour('123'),
        service.getTour('456'),
    ]);
    console.log(service.calls); // 4: different IDs run separately
}

void test();
