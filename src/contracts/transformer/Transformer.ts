export interface Transformer<In, Out> {
    transform: (value: In) => Out
}
