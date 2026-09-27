import type { Logger } from '@contracts/logger/Logger';
import { LogLevel } from '@contracts/logger/Logger';
import { describe, expect, it } from 'vitest';

export function testLoggerContract(
    name: string,
    createLogger: () => Logger,
): void {
    describe(`${name}: Logger contract`, () => {
        it('accepts info, warning, and error messages', () => {
            const logger = createLogger();

            expect(logger.info('Informational message')).toBeUndefined();
            expect(logger.warning('Warning message')).toBeUndefined();
            expect(logger.error('Error message')).toBeUndefined();
        });

        it('accepts every log level', () => {
            const logger = createLogger();

            expect(logger.log(LogLevel.ERROR, 'Error message')).toBeUndefined();
            expect(logger.log(LogLevel.WARNING, 'Warning message')).toBeUndefined();
            expect(logger.log(LogLevel.INFO, 'Informational message')).toBeUndefined();
        });
    });
}
