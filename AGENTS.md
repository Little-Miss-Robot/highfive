# Highfive

`@littlemissrobot/highfive` is a contract-first TypeScript library. Application code depends on the interfaces in `src/contracts`. Adapters in `src/implementations` are interchangeable implementations of those interfaces.

`specs/` is normative. A TypeScript interface, its contract tests, and every adapter must match the specification. Specifications use the key words from [RFC 2119](https://www.rfc-editor.org/info/rfc2119/). One specification may cover a single contract or a small group of related contracts. `specs/container.md` covers `Container` and `ServiceProvider`. `specs/serializer.md` covers `Serializer`, `SerializationCodec`, and `CodecRegistry`. `specs/notifier.md` covers `Notification` and `Notifier`.

## Layout

| Path | Role |
| --- | --- |
| `specs/<name>.md` | Normative requirements for one contract, or a small group of related contracts |
| `src/contracts/` | Public TypeScript interfaces |
| `src/implementations/` | Shipped adapters. Some areas also export a `provider.ts` for `DefaultContainer` |
| `src/testsuite/` | Reusable Vitest suites, published as `@littlemissrobot/highfive/testsuite` |
| `src/decorators/` | Optional method decorators around existing contracts |
| `src/helpers/` | Function wrappers (`withCache`, `withRetry`, and the rest), plus `createFacades`, `createFlow`, and `installBrowserErrorReporting` |
| `src/fakes/` | Test doubles exported for application tests |
| `src/errors/` | Public error types |
| `tests/` | Tests for shipped adapters and helpers. An adapter test calls that adapter's contract suite |
| `src/index.ts` | Public entry. Re-exports contracts, decorators, errors, fakes, helpers, and implementations |
| `src/testsuite/index.ts` | Test-suite entry |

TypeScript path aliases (`@contracts/*`, `@implementations/*`, `@testsuite/*`, `@decorators/*`, `@helpers/*`, `@fakes/*`, `@errors/*`) resolve inside `src/`. `tsconfig.json` includes only `src/`, so tests import source files by relative path.

`src/index.ts` is maintained by hand. It re-exports helpers by name. Barrel files inside `src/contracts`, `src/implementations`, `src/decorators`, `src/helpers`, `src/errors`, `src/fakes`, and `src/testsuite` are generated. After adding, removing, or renaming an export in those trees, run `npm run generate:barrels` instead of editing those `index.ts` files. A new public helper also has to be added to the named export list in `src/index.ts`.

## Commands

```sh
npm test                  # Vitest, once, in jsdom. This is what CI and the pre-commit hook run.
npm run build             # tsup: ESM, CommonJS, and declarations for `.` and `./testsuite`
npm run generate:barrels  # Regenerate barrels in the directories listed above
npm run demo              # Run src/demo.ts with tsx
```

Run `npm test` after any behavior change. Run `npm run build` when public exports, entry points, or published types change. There is no lint script. `npm install` runs `prepare`, which builds with tsup.

## Adding or changing a contract

Keep these artifacts in sync, in this order:

1. **Specification.** Add or update `specs/<name>.md`. State the interface and the requirements an implementation must satisfy. Name the contract-test function in the conformance section, including any sampling limits. Put related contracts in the same specification when they already share one.

2. **Interface.** Add or update `src/contracts/<area>/<Name>.ts`. Declare methods as function properties (`now: () => Date`), not method signatures. The specification may show call-signature syntax; the TypeScript interface stays in property form.

3. **Contract suite.** Add or update `src/testsuite/<area>/test<Name>Contract.ts`. Export a function that takes a display name and a factory, then asserts the specification. Example: `testClockContract(name, createClock)`. Related contracts may share one suite file. Some suites take further arguments, such as sample values or a function that advances time. The conformance section names those arguments.

4. **Adapter, when this repo ships one.** Add `src/implementations/<area>/<Adapter>.ts` implementing the interface. Add `provider.ts` only when the adapter should be registered on `DefaultContainer`. Not every contract has a provider. `Config`, `Filesystem`, `Notifier`, and `Transformer` currently have no shipped adapter.

5. **Adapter test.** Add `tests/<area>/<Adapter>.test.ts` that calls the contract suite with a factory for that adapter. Put behavior that is outside the specification in separate tests, not in the shared suite. Helper tests live in `tests/helpers/`.

6. **Barrels.** Run `npm run generate:barrels`. If the change adds a public helper, add it to the named exports in `src/index.ts`.

7. **README.** Update the list under Contracts, the contract's section (specification link, what the contract does, and its adapters), and the `/testsuite` export list under Testing custom implementations. If you added a provider, add it to the provider list under Optional: container and providers. Document a new decorator or helper under Optional: decorators.

8. **Verify.** Run `npm test`. Run `npm run build` when exports changed.

A contract change updates the specification first, then the interface, the shared suite, every in-repo adapter, and the README. Behavior that is not in the specification belongs on the adapter, not in the contract suite.
