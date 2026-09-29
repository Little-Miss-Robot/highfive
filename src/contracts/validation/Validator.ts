export interface Validator<T> {
    /**
     * Returns the validated value.
     * Throws ValidationError when validation fails.
     */
    validate: (value: unknown) => T
}
