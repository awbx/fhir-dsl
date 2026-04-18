# Test Prompt: `@fhir-dsl/cli`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/cli` to production-grade unit-test coverage using **vitest**, without
modifying any source or introducing new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR query builder + code generator monorepo
(pnpm workspaces). The CLI — binary name `fhir-gen` — wraps
`@fhir-dsl/generator` behind Commander.js and exposes the `generate` subcommand
so end users can produce TypeScript types for any FHIR version or IG.

Monorepo layout: `packages/<pkg>/src/` (source, colocated `*.test.ts`) and
`packages/<pkg>/test/` (separate tree, also picked up by vitest). Tests you
write for this prompt go in `packages/cli/test/`.

## Package brief

- Entry point: `packages/cli/src/index.ts` wires `generateCommand` into a
  Commander program named `fhir-gen`.
- Sole subcommand today: `generateCommand` in
  `packages/cli/src/commands/generate.ts`.
- Public surface: the CLI invoked from a shell; programmatically, only the
  exported `generateCommand` is consumed.
- Runtime deps: `commander`, `@fhir-dsl/generator`.

### Files to read first

1. `packages/cli/src/index.ts`
2. `packages/cli/src/commands/generate.ts`
3. `packages/cli/src/commands/generate.test.ts` (existing coverage)
4. `packages/generator/src/generator.ts` (signature of the `generate()` the CLI calls)

## Existing coverage

`packages/cli/src/commands/generate.test.ts` asserts that each option is
registered with the right required/optional flag and default. **Do not
re-assert these.** Focus on behavior — what the command does when invoked.

## Coverage gaps to fill

Write tests in `packages/cli/test/` using vitest. Cover at minimum:

1. **`--resources` parsing.** Empty string, single value, comma-separated list,
   whitespace around values (`"Patient , Observation "`), duplicate entries,
   and `undefined` (flag absent) must all be handled correctly. Mock
   `generate()` from `@fhir-dsl/generator` (e.g. `vi.mock`) and assert on the
   `resources` field passed to it.
2. **`--validator` acceptance.** `native` and `zod` are accepted; any other
   value must throw an Error whose message includes both the offending value
   and the legal values.
3. **Path resolution.** `--out` and `--src` must be passed through
   `path.resolve` so relative paths become absolute. Assert on the value the
   CLI forwards to `generate()`.
4. **Flag forwarding.** Each of `--ig`, `--cache`, `--expand-valuesets`,
   `--resolve-codesystems`, `--include-spec`, `--strict-extensible`, and
   `--version` reaches `generate()` under the expected key.
5. **`--ig` multi-value.** Commander's `<packages...>` means repeating `--ig`
   yields an array. Confirm the CLI does not double-wrap or split on commas.
6. **Missing required flag.** Omitting `--out` or `--version` causes Commander
   to exit with a non-zero code and print a usage error. (Use
   `program.exitOverride()` / `configureOutput` to capture without killing the
   test process.)
7. **Unknown flag.** Passing `--unknown-flag` surfaces an error rather than
   being silently forwarded to `generate()`.

## Research directives

Read these before writing tests:

- Commander.js v12 docs:
  <https://github.com/tj/commander.js/tree/v12.x#readme> — especially
  `exitOverride`, `configureOutput`, parsing `variadic` args, and
  `requiredOption`.
- FHIR published versions list to confirm version strings the CLI accepts:
  <https://www.hl7.org/fhir/directory.html>.
- FHIR package registry URL format (IG packages like `hl7.fhir.us.core@6.1.0`):
  <https://registry.fhir.org/learn>.

## Conventions

- vitest with `globals: true` (you don't need `import { describe, it, ... }`
  but keeping the imports for parity with the existing style is fine).
- No emojis anywhere — source, tests, docstrings, commit messages.
- Mock `@fhir-dsl/generator`'s `generate` export at the module boundary. Do
  **not** monkey-patch `generateCommand` itself.
- When you need to simulate argv, prefer
  `generateCommand.parseAsync(["node", "fhir-gen", "generate", ...])` with
  `exitOverride` set, so assertions run on Commander's thrown
  `CommanderError` / `InvalidArgumentError`.
- Colocate new tests in `packages/cli/test/` — pick descriptive filenames
  (`generate-resources.test.ts`, `generate-validator.test.ts`, …).

## Workflow

1. Read the source + existing test files listed above.
2. Scaffold a `vi.mock("@fhir-dsl/generator", ...)` helper shared by tests.
3. Write each scenario as its own `it(...)` block. One assertion per concept.
4. Run the gates from the repo root:
   ```bash
   pnpm test --filter=@fhir-dsl/cli     # or: pnpm test (full suite)
   pnpm lint
   pnpm -r typecheck
   ```
5. Iterate until all three are green.

## Success criteria

- Every scenario above has at least one `it(...)` block.
- `pnpm test`, `pnpm lint`, `pnpm -r typecheck` all green.
- No test hits the network or writes to disk.
- No source files under `packages/cli/src/` are modified.

## Out of scope

- Refactoring the CLI or its option schema.
- End-to-end tests that actually invoke `generate()` against FHIR definitions
  (covered by the `generator` prompt).
- Adding new subcommands.
