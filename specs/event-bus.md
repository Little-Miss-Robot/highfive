# EventBus

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`EventBus<E>` publishes typed events and subscribes typed listeners. `E` maps each event name to its payload type. A payload **MAY** be `undefined`.

## Interface

```ts
type EventKey<E> = keyof E;
type EventListener<E, K extends EventKey<E>> = (event: E[K]) => void;

interface EventBus<E extends object> {
    on<K extends EventKey<E>>(
        eventKey: K,
        listener: EventListener<E, K>,
    ): () => void;

    emit<K extends EventKey<E>>(eventKey: K, event: E[K]): void;
}
```

## Requirements

1. `on` **MUST** return a function. Calling that function **MUST** remove the listener it was created for.
2. Removing one listener **MUST NOT** remove other listeners for the same event.
3. `emit` **MUST** call every listener still registered for that event name.
4. `emit` **MUST** pass the payload to each of those listeners, including when the payload is `undefined`.
5. `emit` of one event name **MUST NOT** call listeners registered for a different event name.
6. `emit` of an event that has no listeners **MUST NOT** throw.
7. When a listener throws, `emit` **MUST** throw that same error.

The order in which listeners for one event run is not specified. An implementation **MAY** invoke them in registration order. Whether listeners registered later in the list still run after one listener throws is not specified.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testEventBusContract` checks those requirements.
