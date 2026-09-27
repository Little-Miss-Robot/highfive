import type { RetryPolicy } from '@contracts/execution/RetryPolicy';
import { describe, expect, it } from 'vitest';

export function testRetryPolicyContract(
    name: string,
    createPolicy: () => RetryPolicy,
): void {
    describe(`${name}: RetryPolicy contract`, () => {
        it('returns the result without retrying a successful operation', async () => {
            const attempts: number[] = [];

            const result = await createPolicy().run(async (attempt) => {
                attempts.push(attempt);
                return 'ok';
            }, { attempts: 3, delayMs: 0 });

            expect(result).toBe('ok');
            expect(attempts).toEqual([1]);
        });

        it('retries failures up to the total attempt limit', async () => {
            const attempts: number[] = [];
            const failure = new Error('temporary');

            const result = await createPolicy().run(async (attempt) => {
                attempts.push(attempt);

                if (attempt < 3) {
                    throw failure;
                }
                return 'ok';
            }, { attempts: 3, delayMs: 0 });

            expect(result).toBe('ok');
            expect(attempts).toEqual([1, 2, 3]);
        });

        it('rejects with the original error when attempts are exhausted', async () => {
            const failure = new Error('failed');
            const attempts: number[] = [];

            await expect(
                createPolicy().run(async (attempt) => {
                    attempts.push(attempt);
                    throw failure;
                }, { attempts: 3, delayMs: 0 }),
            ).rejects.toBe(failure);

            expect(attempts).toEqual([1, 2, 3]);
        });

        it('stops when shouldRetry returns false', async () => {
            const failure = new Error('do not retry');
            const attempts: number[] = [];
            const decisions: Array<[unknown, number]> = [];

            await expect(
                createPolicy().run(async (attempt) => {
                    attempts.push(attempt);
                    throw failure;
                }, {
                    attempts: 3,
                    delayMs: 0,
                    shouldRetry: (error, failedAttempt) => {
                        decisions.push([error, failedAttempt]);
                        return false;
                    },
                }),
            ).rejects.toBe(failure);

            expect(attempts).toEqual([1]);
            expect(decisions).toEqual([[failure, 1]]);
        });
    });
}
