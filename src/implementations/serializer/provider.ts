import type { Dependencies } from '@contracts/container/Container';
import type { ServiceProvider } from '@contracts/container/ServiceProvider';
import type { Serializer } from '@contracts/serializer/Serializer';
import { ArrayBufferCodec } from '@implementations/serializer/ArrayBufferCodec';
import { BigIntCodec } from '@implementations/serializer/BigIntCodec';
import { DateCodec } from '@implementations/serializer/DateCodec';
import { JsonSerializer } from '@implementations/serializer/JsonSerializer';
import { MapCodec } from '@implementations/serializer/MapCodec';
import { RegExpCodec } from '@implementations/serializer/RegExpCodec';
import { SetCodec } from '@implementations/serializer/SetCodec';
import { Uint8ArrayCodec } from '@implementations/serializer/Uint8ArrayCodec';
import { URLCodec } from '@implementations/serializer/URLCodec';
import { URLSearchParamsCodec } from '@implementations/serializer/URLSearchParamsCodec';

export interface SerializerDependencies extends Dependencies {
    serializer: () => Serializer
}

export const serializerProvider: ServiceProvider<SerializerDependencies> = {
    register(container) {
        container.singleton('serializer', () => {
            return new JsonSerializer([
                new DateCodec(),
                new BigIntCodec(),
                new URLCodec(),
                new URLSearchParamsCodec(),
                new RegExpCodec(),
                new MapCodec(),
                new SetCodec(),
                new Uint8ArrayCodec(),
                new ArrayBufferCodec(),
            ]);
        });
    },
};
