import type { HttpBodyOptions, HttpMethod } from './HttpClient';

export interface HttpAuthRequest {
    method: HttpMethod
    url: string
    options: HttpBodyOptions
}

export interface HttpAuth {
    authorize: (request: HttpAuthRequest) => Promise<HttpAuthRequest>
}
