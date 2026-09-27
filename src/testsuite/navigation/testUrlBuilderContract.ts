import type { UrlBuilder } from '@contracts/navigation/UrlBuilder';
import { describe, expect, it } from 'vitest';

export interface UrlBuilderContractRoutes {
    home: string
    profile: (id: string) => string
}

export function testUrlBuilderContract(
    name: string,
    createBuilder: () => UrlBuilder<UrlBuilderContractRoutes>,
    routes: UrlBuilderContractRoutes,
): void {
    describe(`${name}: UrlBuilder contract`, () => {
        it('returns a static route', () => {
            expect(createBuilder().make('home')).toBe(routes.home);
        });

        it('forwards arguments to a route', () => {
            const builder = createBuilder();

            expect(builder.make('profile', 'user-1')).toBe(routes.profile('user-1'));
            expect(builder.make('profile', 'user-2')).toBe(routes.profile('user-2'));
        });
    });
}
