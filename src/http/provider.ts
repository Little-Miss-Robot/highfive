import type { Dependencies } from '../container/Container';
import type { ServiceProvider } from '../container/ServiceProvider';
import type { LoggerDependencies } from '../logger/provider';
import type { HttpClient } from './HttpClient';
import LogHttpClient from './LogHttpClient';

export interface HttpDependencies extends Dependencies {
    http: () => HttpClient
}

const httpProvider: ServiceProvider<HttpDependencies, LoggerDependencies> = {
    register(container) {
        container.singleton('http', () => {
            return new LogHttpClient(container.make('logger'));
        });
    },
};

export default httpProvider;
