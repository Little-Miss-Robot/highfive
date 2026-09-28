# Highfive

`@littlemissrobot/highfive` is a contract-first TypeScript library. Application code depends on the interfaces in `src/contracts`. Adapters in `src/implementations` are interchangeable implementations of those interfaces.

`specs/` is normative. A TypeScript interface, its contract tests, and every adapter must match the specification. Specifications use the key words from [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

## Layout

| Path | Role |
| --- | --- |
| `specs/<name>.md` | Normative requirements for one contract |
| `src/contracts/` | Public TypeScript interfaces |
| `src/implementations/` | Shipped adapters. Some areas also export a `provider.ts` for `DefaultContainer` |
| `src/testsuite/` | Reusable Vitest suites, published as `@littlemissrobot/highfive/testsuite` |
| `src/decorators/` | Optional method wrappers around existing contracts |
| `src/fakes/` | Test doubles exported for application tests |
| `src/errors/` | Public error types |
| `tests/` | Adapter tests. Each shipped adapter runs its contract suite here |
| `src/index.ts` | Public entry. Re-exports contracts, decorators, errors, fakes, and implementations |
| `src/testsuite/index.ts` | Test-suite entry |

TypeScript path aliases (`@contracts/*`, `@implementations/*`, `@testsuite/*`, `@decorators/*`, `@fakes/*`, `@errors/*`) resolve inside `src/`. Tests may import source files by relative path.

`src/index.ts` is maintained by hand. Barrel files inside `src/contracts`, `src/implementations`, `src/decorators`, `src/errors`, `src/fakes`, and `src/testsuite` are generated. After adding, removing, or renaming an export in those trees, run `npm run generate:barrels` instead of editing those `index.ts` files.

## Commands

```sh
npm test                  # Vitest, once. This is what CI and the pre-commit hook run.
npm run build             # tsup: ESM, CommonJS, and declarations for `.` and `./testsuite`
npm run generate:barrels  # Regenerate barrels in the directories listed above
```

Run `npm test` after any behavior change. Run `npm run build` when public exports, entry points, or published types change. There is no lint script.

## Adding or changing a contract

Keep these artifacts in sync, in this order:

1. **Specification.** Add or update `specs/<name>.md`. State the interface and the requirements an implementation must satisfy. Name the contract-test function in the conformance section, including any sampling limits.

2. **Interface.** Add or update `src/contracts/<area>/<Name>.ts`. Declare methods as function properties (`now: () => Date`), not method signatures. The specification may show call-signature syntax; the TypeScript interface stays in property form.

3. **Contract suite.** Add or update `src/testsuite/<area>/test<Name>Contract.ts`. Export a function that takes a display name and a factory, then asserts the specification. Example: `testClockContract(name, createClock)`.

4. **Adapter, when this repo ships one.** Add `src/implementations/<area>/<Adapter>.ts` implementing the interface. Add `provider.ts` only when the adapter should be registered on `DefaultContainer`. Not every contract has a provider.

5. **Adapter test.** Add `tests/<area>/<Adapter>.test.ts` that calls the contract suite with a factory for that adapter. Put behavior that is outside the specification in separate tests, not in the shared suite.

6. **Barrels.** Run `npm run generate:barrels`.

7. **README.** Update the contract list, the link under Contract reference, the contract's section (interface and adapters), and the `/testsuite` export list. If you added a provider, add it to the provider list.

8. **Verify.** Run `npm test`. Run `npm run build` when exports changed.

A contract change updates the specification first, then the interface, the shared suite, every in-repo adapter, and the README. Behavior that is not in the specification belongs on the adapter, not in the contract suite.
