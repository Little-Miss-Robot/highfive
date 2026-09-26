export class TimeoutError extends Error {
    constructor(public readonly durationMs: number) {
        super(`Operation timed out after ${durationMs} ms`);
        this.name = 'TimeoutError';
    }
}
