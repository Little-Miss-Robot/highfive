export interface Filesystem {
    read: (path: string) => Promise<Uint8Array>
    write: (path: string, contents: Uint8Array) => Promise<void>
    delete: (path: string) => Promise<void>
    exists: (path: string) => Promise<boolean>
    move: (from: string, to: string) => Promise<void>
}
