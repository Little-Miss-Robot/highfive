import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { HttpAuth } from '@contracts/http/HttpAuth';
import type { HttpClient } from '@contracts/http/HttpClient';
import type { LoggerDependencies } from '@implementations/logger/provider';
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
