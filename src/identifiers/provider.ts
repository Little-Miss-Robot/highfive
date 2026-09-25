import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { IdGenerator } from './IdGenerator';
import { CryptoIdGenerator } from './CryptoIdGenerator';

export interface IdentifiersDependencies extends Dependencies {
    idGenerator: () => IdGenerator
}

const identifiersProvider: ServiceProvider<IdentifiersDependencies> = {
    register(container) {
        container.singleton('idGenerator', () => {
            return new CryptoIdGenerator();
        });
    },
};

export default identifiersProvider;
