import type { IdGenerator } from './IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
    generate(): string {
        return globalThis.crypto.randomUUID();
    }
}
