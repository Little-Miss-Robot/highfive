import type { RouteArgs, UrlBuilder } from '@contracts/navigation/UrlBuilder';

export class DefaultUrlBuilder<Routes extends object> implements UrlBuilder<Routes> {
    private readonly routes: Routes;

    constructor(routes: Routes) {
        this.routes = routes;
    }

    public make<Key extends keyof Routes & string>(
        key: Key,
        ...args: RouteArgs<Routes[Key]>
    ): string {
        if (!Object.prototype.hasOwnProperty.call(this.routes, key)) {
            throw new Error(`Unknown route: ${key}`);
        }

        const route = this.routes[key];

        if (typeof route === 'string') {
            return route;
        }

        if (typeof route !== 'function') {
            throw new TypeError(`Invalid route definition: ${key}`);
        }

        const result: unknown = route(...args);

        if (typeof result !== 'string') {
            throw new TypeError(`Route "${key}" did not return a string`);
        }

        return result;
    }
}
