export type HttpOptions = Omit<RequestInit, 'method' | 'body'>;

export type HttpBodyOptions = HttpOptions & {
    body?: BodyInit | null
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpClient {
    get: (url: string, options?: HttpOptions) => Promise<Response>
    post: (url: string, options?: HttpBodyOptions) => Promise<Response>
    put: (url: string, options?: HttpBodyOptions) => Promise<Response>
    patch: (url: string, options?: HttpBodyOptions) => Promise<Response>
    delete: (url: string, options?: HttpBodyOptions) => Promise<Response>
}
