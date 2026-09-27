import type { IdGenerator } from '@contracts/identifiers/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
    generate(): string {
        return globalThis.crypto.randomUUID();
    }
}
