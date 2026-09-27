import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { LoggerDependencies } from '../logger/provider';
import type { HttpAuth } from './HttpAuth';
import type { HttpClient } from './HttpClient';
import { BearerHttpAuth } from './BearerHttpAuth';
import { FetchHttpClient } from './FetchHttpClient';

export interface HttpDependencies extends Dependencies {
    http: () => HttpClient
    httpAuth: () => HttpAuth
}

const httpProvider: ServiceProvider<HttpDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('httpAuth', () => {
            return new BearerHttpAuth(async () => 'token');
        });

        container.singleton('http', () => {
            return new FetchHttpClient(
                container.make('httpAuth'),
            );
        });
    },
};

export default httpProvider;
