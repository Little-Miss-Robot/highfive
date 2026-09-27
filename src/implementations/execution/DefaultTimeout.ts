import type { Timeout } from '@contracts/execution/Timeout';
import { TimeoutError } from '../../errors/TimeoutError';

export default class DefaultTimeout implements Timeout {
    async run<T>(
        operation: (signal: AbortSignal) => Promise<T>,
        durationMs: number,
        signal?: AbortSignal,
    ): Promise<T> {
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
            throw new RangeError('durationMs must be a positive, finite number');
        }

        if (signal?.aborted) {
            throw signal.reason;
        }

        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;

        const onAbort = () => {
            controller.abort(signal?.reason);
        };

        signal?.addEventListener('abort', onAbort, { once: true });

        try {
            return await new Promise<T>((resolve, reject) => {
                controller.signal.addEventListener('abort', () => {
                    reject(controller.signal.reason);
                }, { once: true });

                timer = setTimeout(() => {
                    controller.abort(new TimeoutError(durationMs));
                }, durationMs);

                Promise.resolve()
                    .then(() => operation(controller.signal))
                    .then(resolve, reject);
            });
        }
        finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
        }
    }
}
