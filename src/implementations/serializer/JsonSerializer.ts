import type { Serializer } from '@contracts/serializer/Serializer';

export class JsonSerializer<T> implements Serializer<T> {
    private readonly decode: (value: unknown) => T;

    constructor(decode: (value: unknown) => T) {
        this.decode = decode;
    }

    public serialize(value: T): string {
        const json = JSON.stringify(value);

        if (json === undefined) {
            throw new TypeError('Value cannot be serialized as JSON');
        }

        return json;
    }

    public deserialize(json: string): T {
        const value: unknown = JSON.parse(json);
        return this.decode(value);
    }
}
