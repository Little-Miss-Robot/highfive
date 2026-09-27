import type { Notification } from '@contracts/notifications/Notification';

export interface Notifier {
    notify: (notification: Notification) => string
    dismiss: (id: string) => void
}
