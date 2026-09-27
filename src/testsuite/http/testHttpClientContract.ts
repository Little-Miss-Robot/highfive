import type { HttpAuthRequest } from '@contracts/http/HttpAuth';
import type { HttpClient, HttpMethod } from '@contracts/http/HttpClient';
import { describe, expect, it } from 'vitest';

export type HttpClientContractHandler = (
    request: HttpAuthRequest,
) => Response | Promise<Response>;

interface ExpectedHttpRequest {
    method: HttpMethod
    url: string
    accept?: string
    body?: string
    signal?: AbortSignal
}

async function expectExchange(
    createClient: (handler: HttpClientContractHandler) => HttpClient,
    send: (client: HttpClient) => Promise<Response>,
    expected: ExpectedHttpRequest,
): Promise<void> {
    const response = new Response('payload', { status: 200 });
    const requests: HttpAuthRequest[] = [];
    const client = createClient((request) => {
        requests.push(request);
        return response;
    });

    await expect(send(client)).resolves.toBe(response);
    expect(requests).toHaveLength(1);

    const request = requests[0];

    expect(request?.method).toBe(expected.method);
    expect(request?.url).toBe(expected.url);

    if (expected.accept !== undefined) {
        expect(new Headers(request?.options.headers).get('Accept')).toBe(expected.accept);
    }

    if (expected.body !== undefined) {
        expect(request?.options.body).toBe(expected.body);
    }

    if (expected.signal !== undefined) {
        expect(request?.options.signal).toBe(expected.signal);
    }
}

export function testHttpClientContract(
    name: string,
    createClient: (handler: HttpClientContractHandler) => HttpClient,
): void {
    describe(`${name}: HttpClient contract`, () => {
        it('sends GET without options and returns the response', async () => {
            await expectExchange(
                createClient,
                (client) => client.get('/health'),
                { method: 'GET', url: '/health' },
            );
        });

        it('sends GET and forwards its headers', async () => {
            await expectExchange(
                createClient,
                (client) => client.get('/items/1', {
                    headers: { Accept: 'application/json' },
                }),
                { method: 'GET', url: '/items/1', accept: 'application/json' },
            );
        });

        it('sends POST and forwards its body', async () => {
            await expectExchange(
                createClient,
                (client) => client.post('/items', {
                    headers: { Accept: 'application/json' },
                    body: '{"title":"Ship it"}',
                }),
                {
                    method: 'POST',
                    url: '/items',
                    accept: 'application/json',
                    body: '{"title":"Ship it"}',
                },
            );
        });

        it('sends PUT and forwards its body', async () => {
            await expectExchange(
                createClient,
                (client) => client.put('/items/1', {
                    headers: { Accept: 'application/json' },
                    body: '{"title":"Update"}',
                }),
                {
                    method: 'PUT',
                    url: '/items/1',
                    accept: 'application/json',
                    body: '{"title":"Update"}',
                },
            );
        });

        it('sends PATCH and forwards its body', async () => {
            await expectExchange(
                createClient,
                (client) => client.patch('/items/1', {
                    headers: { Accept: 'application/json' },
                    body: '{"done":true}',
                }),
                {
                    method: 'PATCH',
                    url: '/items/1',
                    accept: 'application/json',
                    body: '{"done":true}',
                },
            );
        });

        it('sends DELETE and forwards its body', async () => {
            await expectExchange(
                createClient,
                (client) => client.delete('/items/1', {
                    headers: { Accept: 'application/json' },
                    body: '{"reason":"done"}',
                }),
                {
                    method: 'DELETE',
                    url: '/items/1',
                    accept: 'application/json',
                    body: '{"reason":"done"}',
                },
            );
        });

        it('forwards an abort signal', async () => {
            const controller = new AbortController();

            await expectExchange(
                createClient,
                (client) => client.get('/items/1', { signal: controller.signal }),
                { method: 'GET', url: '/items/1', signal: controller.signal },
            );
        });

        it('waits for an asynchronous response', async () => {
            let release!: (response: Response) => void;
            const pending = new Promise<Response>((resolve) => {
                release = resolve;
            });
            const client = createClient(() => pending);
            let settled = false;
            const result = client.get('/slow').then((response) => {
                settled = true;
                return response;
            });

            await Promise.resolve();
            expect(settled).toBe(false);

            const response = new Response('done', { status: 200 });
            release(response);

            await expect(result).resolves.toBe(response);
        });

        it('rejects with the handler error', async () => {
            const failure = new Error('network down');
            const client = createClient(async () => {
                throw failure;
            });

            await expect(client.post('/tasks', { body: '{}' })).rejects.toBe(failure);
        });
    });
}
