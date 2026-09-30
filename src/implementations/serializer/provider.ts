import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { Serializer } from '@contracts/serializer/Serializer';
import { DateCodec } from '@implementations/serializer/DateCodec';
import { JsonSerializer } from '@implementations/serializer/JsonSerializer';

export interface SerializerDependencies extends Dependencies {
    serializer: () => Serializer
}

export const serializerProvider: ServiceProvider<SerializerDependencies> = {
    register(container) {
        container.singleton('serializer', () => {
            return new JsonSerializer([
                new DateCodec(),
            ]);
        });
    },
};
