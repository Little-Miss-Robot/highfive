import type { Notification } from '@contracts/notifications/Notification';
import type { Notifier } from '@contracts/notifications/Notifier';
import { describe, expect, it } from 'vitest';

const levels: Array<Notification['level']> = ['info', 'success', 'warning', 'error'];

export function testNotifierContract(
    name: string,
    createNotifier: () => Notifier,
): void {
    describe(`${name}: Notifier contract`, () => {
        it('returns a distinct id for each notification', () => {
            const notifier = createNotifier();
            const first = notifier.notify({ message: 'Saved', level: 'success' });
            const second = notifier.notify({ message: 'Saved', level: 'success' });

            expect(first).toEqual(expect.any(String));
            expect(second).toEqual(expect.any(String));
            expect(first).not.toBe(second);
        });

        it('accepts every notification level', () => {
            const notifier = createNotifier();

            for (const level of levels) {
                expect(notifier.notify({ message: level, level })).toEqual(expect.any(String));
            }
        });

        it('accepts a default, timed, and persistent notification', () => {
            const notifier = createNotifier();
            const notifications: Notification[] = [
                { message: 'Saved', level: 'success' },
                { message: 'Retrying', level: 'info', durationMs: 1_500 },
                { message: 'Disconnected', level: 'error', durationMs: null },
            ];

            for (const notification of notifications) {
                expect(notifier.notify(notification)).toEqual(expect.any(String));
            }
        });

        it('dismisses a notification by the id notify returned', () => {
            const notifier = createNotifier();
            const id = notifier.notify({ message: 'Saved', level: 'success' });

            expect(() => {
                notifier.dismiss(id);
            }).not.toThrow();
        });
    });
}
