import { resolve } from '@implementations/container/useContainer';

export function id() {
    return resolve('idGenerator');
}
