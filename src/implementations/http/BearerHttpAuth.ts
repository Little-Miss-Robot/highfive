import type { HttpAuth, HttpAuthRequest } from '@contracts/http/HttpAuth';

type TokenFetcher = (signal?: AbortSignal | null) => Promise<string>;

export class BearerHttpAuth implements HttpAuth {
    private readonly getToken: TokenFetcher;

    constructor(getToken: TokenFetcher) {
        this.getToken = getToken;
    }

    async authorize(request: HttpAuthRequest): Promise<HttpAuthRequest> {
        const token = await this.getToken(request.options.signal);
        const headers = new Headers(request.options.headers);

        headers.set('Authorization', `Bearer ${token}`);

        return {
            ...request,
            options: {
                ...request.options,
                headers,
            },
        };
    }
}
