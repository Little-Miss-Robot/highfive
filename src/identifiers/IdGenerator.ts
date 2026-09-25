// Generates an identifier that is unique for the application's lifetime
export interface IdGenerator {
    generate: () => string
}
