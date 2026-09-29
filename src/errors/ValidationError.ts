import type { ValidationIssue } from '@contracts/validation/ValidationIssue';

export class ValidationError extends Error {
    public readonly issues: readonly ValidationIssue[];

    constructor(issues: readonly ValidationIssue[]) {
        super('Validation failed');
        this.issues = issues;
        this.name = 'ValidationError';
    }
}
