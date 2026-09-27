export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    message: string
    level: NotificationLevel

    // Omit to use the implementation's normal duration; null keeps it visible.
    durationMs?: number | null
}
