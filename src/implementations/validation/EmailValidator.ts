import type { Validator } from '@contracts/validation/Validator';
import { ValidationError } from '@errors/ValidationError';

const localPattern = /^[\w.!#$%&'*+/=?^`{|}~-]+$/;
const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function isEmail(value: string): boolean {
    const at = value.indexOf('@');

    if (at <= 0 || at !== value.lastIndexOf('@')) {
        return false;
    }

    const local = value.slice(0, at);
    const domain = value.slice(at + 1);

    if (local.length > 64 || domain.length > 255 || !localPattern.test(local)) {
        return false;
    }

    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
        return false;
    }

    const labels = domain.split('.');
    const tld = labels[labels.length - 1];

    if (labels.length < 2 || tld === undefined || tld.length < 2) {
        return false;
    }

    return labels.every(label => labelPattern.test(label));
}

export class EmailValidator implements Validator<string> {
    public validate(value: unknown): string {
        if (typeof value !== 'string' || !isEmail(value)) {
            throw new ValidationError([
                { path: [], message: 'Expected an email address' },
            ]);
        }

        return value;
    }
}
