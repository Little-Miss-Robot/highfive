import type { Cache } from '../../src/contracts/cache/Cache';
import type { Tracer } from '../../src/contracts/diagnostics/Tracer';
import type { Deduplicator } from '../../src/contracts/execution/Deduplicator';
import type { RetryPolicy } from '../../src/contracts/execution/RetryPolicy';
import type { Timeout } from '../../src/contracts/execution/Timeout';
import type { EventBus } from '../../src/contracts/events/EventBus';
import type { IdGenerator } from '../../src/contracts/identifiers/IdGenerator';
import type { Logger } from '../../src/contracts/logger/Logger';
import type { Serializer } from '../../src/contracts/serializer/Serializer';
import type { Validator } from '../../src/contracts/validation/Validator';
import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/ValidationError';
import { withCache } from '../../src/helpers/withCache';
import { withEmit } from '../../src/helpers/withEmit';
import { withLog } from '../../src/helpers/withLog';
import { withRetry } from '../../src/helpers/withRetry';
import { withSingleFlight } from '../../src/helpers/withSingleFlight';
import { withTimeout } from '../../src/helpers/withTimeout';
import { withTrace } from '../../src/helpers/withTrace';
import { withValidate } from '../../src/helpers/withValidate';
import { SingleFlightDeduplicator } from '../../src/implementations/execution/SingleFlightDeduplicator';

function createCache() {
    const stored = new Map<string, { value: string, ttlMs?: number }>();
    const cache: Cache = {
        async get(key) {
            return stored.get(key)?.value;
        },
        async set(key, value, options) {
            stored.set(key, { value, ttlMs: options?.ttlMs });
        },
        async delete(key) {
            stored.delete(key);
        },
    };

    return { cache, stored };
}

function createIds(): IdGenerator {
    let next = 0;

    return {
        generate: () => {
            next += 1;
            return String(next);
        },
    };
}

describe('withCache', () => {
    it('stores a fulfilled result and reuses it', async () => {
        const { cache, stored } = createCache();
        let calls = 0;
        const load = withCache(cache, (id: string) => `user:${id}`, 1000)(
            async (id: string) => {
                calls += 1;
                return { id };
            },
        );

        await expect(load('ada')).resolves.toEqual({ id: 'ada' });
        await expect(load('ada')).resolves.toEqual({ id: 'ada' });
        await expect(load('grace')).resolves.toEqual({ id: 'grace' });

        expect(calls).toBe(2);
        expect(stored.get('user:ada')).toEqual({
            value: JSON.stringify({ id: 'ada' }),
            ttlMs: 1000,
        });
    });

    it('does not store a result JSON cannot represent or a rejected call', async () => {
        const { cache } = createCache();
        let missing = 0;
        const loadMissing = withCache(cache, 'missing')(async () => {
            missing += 1;
            return undefined;
        });
        let failed = 0;
        const loadFailed = withCache(cache, 'failed')(async () => {
            failed += 1;
            throw new Error('nope');
        });

        await loadMissing();
        await loadMissing();
        await expect(loadFailed()).rejects.toThrow('nope');
        await expect(loadFailed()).rejects.toThrow('nope');

        expect(missing).toBe(2);
        expect(failed).toBe(2);
    });

    it('uses a serializer when one is provided', async () => {
        const { cache, stored } = createCache();
        const serializer: Serializer<string> = {
            serialize: value => `wrapped:${JSON.stringify(value)}`,
            deserialize: <T>(value: string) => JSON.parse(value.slice('wrapped:'.length)) as T,
        };
        let calls = 0;
        const load = withCache(cache, 'user', undefined, { serializer })(async () => {
            calls += 1;
            return { name: 'Ada' };
        });

        await load();
        await expect(load()).resolves.toEqual({ name: 'Ada' });

        expect(calls).toBe(1);
        expect(stored.get('user')?.value).toBe('wrapped:{"name":"Ada"}');
    });
});

describe('withTimeout', () => {
    it('runs the operation through the timeout', async () => {
        const durations: number[] = [];
        const timeout: Timeout = {
            run: (operation, durationMs) => {
                durations.push(durationMs);
                return operation(new AbortController().signal);
            },
        };
        const load = withTimeout(timeout, 25)(async (id: string) => id);

        await expect(load('ada')).resolves.toBe('ada');
        expect(durations).toEqual([25]);
    });
});

describe('withRetry', () => {
    it('runs the operation through the retry policy', async () => {
        const attempts: unknown[] = [];
        const retryPolicy: RetryPolicy = {
            run: (operation, options) => {
                attempts.push(options);
                return operation(1);
            },
        };
        const load = withRetry(retryPolicy, { attempts: 3 })(async (id: string) => id);

        await expect(load('ada')).resolves.toBe('ada');
        expect(attempts).toEqual([{ attempts: 3 }]);
    });
});

describe('withSingleFlight', () => {
    it('coalesces concurrent calls and separates keys', async () => {
        const deduplicator = new SingleFlightDeduplicator();
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        let calls = 0;
        const load = withSingleFlight(deduplicator, createIds(), (id: string) => id)(
            async (id: string) => {
                calls += 1;
                await gate;
                return id;
            },
        );

        const first = load('ada');
        const second = load('ada');
        const third = load('grace');
        release();

        await expect(Promise.all([first, second, third])).resolves.toEqual([
            'ada',
            'ada',
            'grace',
        ]);
        expect(calls).toBe(2);
    });

    it('gives each wrapped function its own identity', async () => {
        const keys: string[] = [];
        const deduplicator: Deduplicator = {
            run: (key, operation) => {
                keys.push(key);
                return operation();
            },
        };
        const wrap = withSingleFlight(deduplicator, createIds());
        const loadUser = wrap(async () => 'user');
        const loadPost = wrap(async () => 'post');

        await loadUser();
        await loadPost();

        expect(keys).toHaveLength(2);
        expect(keys[0]).not.toBe(keys[1]);
    });
});

describe('withTrace', () => {
    it('uses the supplied name or the function name', async () => {
        const names: string[] = [];
        const tracer: Tracer = {
            trace: (name, operation) => {
                names.push(name);
                return operation();
            },
        };

        async function loadUser() {
            return 'Ada';
        }

        await withTrace(tracer)(loadUser)();
        await withTrace(tracer, 'custom')(async () => 'Grace')();
        await withTrace(tracer)(async () => 'Anon')();

        expect(names).toEqual(['loadUser', 'custom', '<anonymous>']);
    });
});

describe('withLog', () => {
    it('logs a fulfilled result and skips a rejected call', async () => {
        const messages: string[] = [];
        const logger: Logger = {
            error: () => undefined,
            warning: () => undefined,
            info: (message) => {
                messages.push(message);
            },
            log: () => undefined,
        };

        async function loadUser() {
            return 'Ada';
        }

        const load = withLog(logger, value => `name=${String(value)}`)(loadUser);
        const fail = withLog(logger, undefined, 'fail')(async () => {
            throw new Error('nope');
        });

        await expect(load()).resolves.toBe('Ada');
        await expect(fail()).rejects.toThrow('nope');
        expect(messages).toEqual(['loadUser returned: name=Ada']);
    });
});

describe('withEmit', () => {
    it('emits a fulfilled result and skips a rejected call', async () => {
        const events: string[] = [];
        const bus: EventBus<{ ready: string }> = {
            on: () => () => undefined,
            emit: (_event, payload) => {
                events.push(payload);
            },
        };
        const load = withEmit(bus, 'ready')(async (name: string) => name);
        const fail = withEmit(bus, 'ready')(async () => {
            throw new Error('nope');
        });

        await expect(load('Ada')).resolves.toBe('Ada');
        await expect(fail()).rejects.toThrow('nope');
        expect(events).toEqual(['Ada']);
    });
});

describe('withValidate', () => {
    it('returns the validator result and skips validation when the call rejects', async () => {
        let validations = 0;
        const validator: Validator<{ name: string }> = {
            validate: (value) => {
                validations += 1;

                if (
                    typeof value !== 'object'
                    || value === null
                    || !('name' in value)
                    || typeof value.name !== 'string'
                ) {
                    throw new ValidationError([
                        { path: ['name'], message: 'Expected a name' },
                    ]);
                }

                return { name: value.name };
            },
        };
        const load = withValidate(validator)(async () => ({
            name: 'Ada',
            extra: true,
        }));
        const fail = withValidate(validator)(async (): Promise<{ name: string }> => {
            throw new Error('nope');
        });

        await expect(load()).resolves.toEqual({ name: 'Ada' });
        await expect(fail()).rejects.toThrow('nope');
        await expect(
            withValidate(validator)(async () => ({ name: 1 }))(),
        ).rejects.toThrow(ValidationError);
        expect(validations).toBe(2);
    });
});
