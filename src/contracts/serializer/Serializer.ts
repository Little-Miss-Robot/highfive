export interface Serializer<Value, Serialized = string> {
    serialize: (value: Value) => Serialized
    deserialize: (serialized: Serialized) => Value
}
