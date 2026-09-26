export class HttpStatusError extends Error {
    private readonly response: Response;

    constructor(response: Response) {
        super(`HTTP ${response.status} ${response.statusText}`);
        this.name = 'HttpStatusError';
        this.response = response;
    }

    get status(): number {
        return this.response.status;
    }
}
