# Notification and Notifier

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Notification` describes a user-facing message. `Notifier` presents that message and can dismiss it.

## Interfaces

```ts
type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    message: string;
    level: NotificationLevel;
    durationMs?: number | null;
}

interface Notifier {
    notify(notification: Notification): string;
    dismiss(id: string): void;
}
```

## Notification

1. `level` **MUST** be `"info"`, `"success"`, `"warning"`, or `"error"`.
2. `message` **MUST** be a string.
3. When `durationMs` is omitted, the notifier **MUST** show the notification for the implementation's default duration.
4. When `durationMs` is `null`, the notification **MUST** stay visible until `dismiss` is called with its id.
5. When `durationMs` is a number, the notifier **SHOULD** dismiss the notification automatically after that many milliseconds.

## Notifier

1. `notify` **MUST** return a string id.
2. Two calls to `notify` **MUST** return different ids, including when both notifications have the same message and level.
3. `notify` **MUST** accept every `NotificationLevel`.
4. `notify` **MUST** accept a notification that omits `durationMs`, a notification whose `durationMs` is a number, and a notification whose `durationMs` is `null`.
5. `dismiss` **MUST** accept an id that `notify` returned, and that call **MUST NOT** throw.

## Unspecified

This specification does not require a particular result when `dismiss` is called with an id that `notify` did not return.

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testNotifierContract` checks the Notifier requirements. The duration rules are part of this contract. The shared suite checks that `notify` accepts each duration form.
