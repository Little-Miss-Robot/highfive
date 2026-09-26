export interface Cache {
    get: (key: string) => Promise<string | undefined>

    set: (
        key: string,
        value: string,
        options?: { ttlMs?: number },
    ) => Promise<void>

    delete: (key: string) => Promise<void>
}
