export interface Config<Values extends object> {
    get: <Key extends keyof Values>(key: Key) => Values[Key]
}
