# Filesystem

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

`Filesystem` reads, writes, deletes, checks, and moves binary files.

## Interface

```ts
interface Filesystem {
    read(path: string): Promise<Uint8Array>;
    write(path: string, contents: Uint8Array): Promise<void>;
    delete(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    move(from: string, to: string): Promise<void>;
}
```

## Requirements

1. Every method **MUST** return a promise.
2. `exists` of a path that has not been written **MUST** fulfill with `false`.
3. `write` **MUST** store the given bytes at `path`. A later `read` of that path **MUST** fulfill with the same bytes. This includes an empty `Uint8Array`.
4. After a successful `write`, `exists` of that path **MUST** fulfill with `true`.
5. Files at different paths **MUST** be independent.
6. `write` of a path that already has contents **MUST** replace those contents. A later `read` **MUST** fulfill with the replacement.
7. After `delete` of a written path, `exists` of that path **MUST** fulfill with `false`.
8. `move` **MUST** make the source path absent and the destination path present. `read` of the destination **MUST** fulfill with the bytes that were at the source. `exists` of the source **MUST** then fulfill with `false`.

## Unspecified

This specification does not require a particular result for:

- `read` or `delete` of a path that is not present
- `move` when the destination already exists
- `move` when the source does not exist

## Conformance

An implementation conforms to this specification when it satisfies the requirements above. `testFilesystemContract` checks those requirements.
