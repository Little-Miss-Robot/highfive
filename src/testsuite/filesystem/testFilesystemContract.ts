import type { Filesystem } from '@contracts/filesystem/Filesystem';
import { describe, expect, it } from 'vitest';

export function testFilesystemContract(
    name: string,
    createFilesystem: () => Filesystem,
): void {
    describe(`${name}: Filesystem contract`, () => {
        let nextPath = 0;

        const path = () =>
            `filesystem-contract/${name}/${Date.now()}/${++nextPath}`;

        it('reports that a missing path does not exist', async () => {
            expect(await createFilesystem().exists(path())).toBe(false);
        });

        it('stores and retrieves bytes unchanged', async () => {
            const filesystem = createFilesystem();
            const emptyPath = path();
            const binaryPath = path();
            const empty = new Uint8Array();
            const binary = new Uint8Array([0, 255, 10, 13]);

            await filesystem.write(emptyPath, empty);
            await filesystem.write(binaryPath, binary);

            expect(await filesystem.read(emptyPath)).toEqual(empty);
            expect(await filesystem.read(binaryPath)).toEqual(binary);
        });

        it('reports that a written path exists', async () => {
            const filesystem = createFilesystem();
            const file = path();

            expect(await filesystem.exists(file)).toBe(false);

            await filesystem.write(file, new Uint8Array([1]));

            expect(await filesystem.exists(file)).toBe(true);
        });

        it('keeps different paths independent', async () => {
            const filesystem = createFilesystem();
            const first = path();
            const second = path();

            await filesystem.write(first, new Uint8Array([1]));
            await filesystem.write(second, new Uint8Array([2]));

            expect(await filesystem.read(first)).toEqual(new Uint8Array([1]));
            expect(await filesystem.read(second)).toEqual(new Uint8Array([2]));
        });

        it('replaces an existing file', async () => {
            const filesystem = createFilesystem();
            const file = path();

            await filesystem.write(file, new Uint8Array([1]));
            await filesystem.write(file, new Uint8Array([2, 3]));

            expect(await filesystem.read(file)).toEqual(new Uint8Array([2, 3]));
        });

        it('deletes a file', async () => {
            const filesystem = createFilesystem();
            const file = path();

            await filesystem.write(file, new Uint8Array([1]));
            await filesystem.delete(file);

            expect(await filesystem.exists(file)).toBe(false);
        });

        it('moves a file', async () => {
            const filesystem = createFilesystem();
            const from = path();
            const to = path();
            const contents = new Uint8Array([0, 255]);

            await filesystem.write(from, contents);
            await filesystem.move(from, to);

            expect(await filesystem.exists(from)).toBe(false);
            expect(await filesystem.exists(to)).toBe(true);
            expect(await filesystem.read(to)).toEqual(contents);
        });
    });
}
