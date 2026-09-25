export type AnalyticsValue =
    | string
    | number
    | boolean
    | null;

export type AnalyticsProperties = Record<string, AnalyticsValue>;

export interface Analytics {
    track: (event: string, properties?: AnalyticsProperties,) => void
}
