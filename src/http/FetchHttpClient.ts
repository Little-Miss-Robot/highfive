import type { HttpAuth } from './HttpAuth';
import type {
    HttpBodyOptions,
    HttpClient,
    HttpMethod,
    HttpOptions,
} from './HttpClient';
import { HttpStatusError } from '../errors/HttpStatusError';

export class FetchHttpClient implements HttpClient {
    private readonly auth?: HttpAuth;

    constructor(auth?: HttpAuth) {
        this.auth = auth;
    }

    public async get(url: string, options?: HttpOptions): Promise<Response> {
        return this.request('GET', url, options);
    }

    public async post(url: string, options?: HttpBodyOptions): Promise<Response> {
        return this.request('POST', url, options);
    }

    public async put(url: string, options?: HttpBodyOptions): Promise<Response> {
        return this.request('PUT', url, options);
    }

    public async patch(url: string, options?: HttpBodyOptions): Promise<Response> {
        return this.request('PATCH', url, options);
    }

    public async delete(url: string, options?: HttpBodyOptions): Promise<Response> {
        return this.request('DELETE', url, options);
    }

    private async request(method: HttpMethod, url: string, options: HttpBodyOptions = {}): Promise<Response> {
        const request = { method, url, options };
        const authorized = this.auth
            ? await this.auth.authorize(request)
            : request;

        const response = await fetch(authorized.url, {
            ...authorized.options,
            method,
        });

        if (!response.ok) {
            throw new HttpStatusError(response);
        }

        return response;
    }
}
