import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { IdGenerator } from '@contracts/identifiers/IdGenerator';
import { CryptoIdGenerator } from './CryptoIdGenerator';

export interface IdentifiersDependencies extends Dependencies {
    idGenerator: () => IdGenerator
}

export const identifiersProvider: ServiceProvider<IdentifiersDependencies> = {
    register(container) {
        container.singleton('idGenerator', () => {
            return new CryptoIdGenerator();
        });
    },
};
