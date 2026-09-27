import type { HttpAuth, HttpAuthRequest } from '@contracts/http/HttpAuth';
import { describe, expect, it } from 'vitest';

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

function expectAuthorizedRequest(request: HttpAuthRequest): void {
    expect(httpMethods).toContain(request.method);
    expect(typeof request.url).toBe('string');
    expect(request.options).toEqual(expect.any(Object));
}

export function testHttpAuthContract(
    name: string,
    createAuth: () => HttpAuth,
): void {
    describe(`${name}: HttpAuth contract`, () => {
        it('authorizes a request', async () => {
            const authorized = await createAuth().authorize({
                method: 'GET',
                url: 'https://example.test/items',
                options: {
                    headers: { Accept: 'application/json' },
                },
            });

            expectAuthorizedRequest(authorized);
        });

        it('authorizes a request that carries a body and a signal', async () => {
            const controller = new AbortController();
            const authorized = await createAuth().authorize({
                method: 'POST',
                url: 'https://example.test/tasks',
                options: {
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"title":"Ship it"}',
                    signal: controller.signal,
                },
            });

            expectAuthorizedRequest(authorized);
        });
    });
}
