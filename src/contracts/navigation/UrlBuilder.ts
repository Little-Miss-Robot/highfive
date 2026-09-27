export type RouteArgs<Definition> =
    Definition extends (...args: infer Args) => string
        ? Args
        : [];

export interface UrlBuilder<Routes extends object> {
    make: <Key extends keyof Routes & string>(
        key: Key,
        ...args: RouteArgs<Routes[Key]>
    ) => string
}
