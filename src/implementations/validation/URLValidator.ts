import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

export class URLValidator implements Validator<string> {
    public validate(value: unknown): string {
        if (typeof value !== 'string' || !isAbsoluteUrl(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected a URL' },
            ]);
        }

        return value;
    }
}

function isAbsoluteUrl(value: string): boolean {
    try {
        return Boolean(new URL(value));
    }
    catch {
        return false;
    }
}
