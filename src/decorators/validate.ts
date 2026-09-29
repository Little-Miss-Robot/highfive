import type { Validator } from '@contracts/validation/Validator';

export function validate<T>(validator: Validator<T>) {
    return function <This, Args extends unknown[]>(
        method: (this: This, ...args: Args) => Promise<T>,
        _context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<T>
        >,
    ) {
        return async function (
            this: This,
            ...args: Args
        ): Promise<T> {
            const result = await method.apply(this, args);

            return validator.validate(result);
        };
    };
}
