export interface ValidationIssue {
    readonly path: readonly (string | number)[]
    readonly message: string
}
