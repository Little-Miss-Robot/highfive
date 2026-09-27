export type AnalyticsValue =
    | string
    | number
    | boolean
    | null;

export type AnalyticsPayload = Record<string, AnalyticsValue>;

export interface Analytics {
    track: (event: string, properties?: AnalyticsPayload,) => void
}
