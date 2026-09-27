import { DefaultUrlBuilder } from '../../src/implementations/navigation/DefaultUrlBuilder';
import { testUrlBuilderContract } from '../../src/testsuite';

const routes = {
    'home': '/',
    'dashboard': '/dashboard',
    'profile': (id: string) => `/users/${id}`,
    'blog.view': (pageSlug: string, slug: string) => `/blog/${pageSlug}/${slug}`,
};

testUrlBuilderContract(
    'DefaultUrlBuilder',
    () => new DefaultUrlBuilder(routes),
    routes,
);
