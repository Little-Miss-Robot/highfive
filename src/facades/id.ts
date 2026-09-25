import container from '../container';

export default function id() {
    return container.make('idGenerator');
}
