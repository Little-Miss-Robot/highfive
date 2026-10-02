import type { Validator } from '@contracts/validation/Validator';

export function withValidate<T>(validator: Validator<T>) {
    return <Args extends unknown[]>(
        operation: (...args: Args) => Promise<unknown>,
    ): (...args: Args) => Promise<T> => {
        return async (...args: Args): Promise<T> => {
            const result = await operation(...args);
            return validator.validate(result);
        };
    };
}
