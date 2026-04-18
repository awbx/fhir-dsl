# Testing fhir-dsl

This document indexes per-package **test prompts** used to drive comprehensive unit-test
generation against the fhir-dsl codebase. The prompts are meant to be fed — verbatim — to
a capable coding AI (Claude, GPT, Gemini, etc.). Each prompt is self-contained: a model
that has only the repo and its package's `PROMPT.md` has everything it needs to produce
useful, non-duplicate tests.

## Per-package prompts

| Package | Prompt | Scope |
|---|---|---|
| `@fhir-dsl/cli` | [`packages/cli/test/PROMPT.md`](packages/cli/test/PROMPT.md) | `fhir-gen generate` flag parsing, validation, exit codes |
| `@fhir-dsl/core` | [`packages/core/test/PROMPT.md`](packages/core/test/PROMPT.md) | client, search/read/transaction builders, validation chain, type-level inference |
| `@fhir-dsl/example` | [`packages/example/test/PROMPT.md`](packages/example/test/PROMPT.md) | consumer smoke test against committed generated tree |
| `@fhir-dsl/fhirpath` | [`packages/fhirpath/test/PROMPT.md`](packages/fhirpath/test/PROMPT.md) | FHIRPath builder grammar + evaluator against the HL7 spec |
| `@fhir-dsl/generator` | [`packages/generator/test/PROMPT.md`](packages/generator/test/PROMPT.md) | parser, every emitter, end-to-end `generate()` to tmpdir |
| `@fhir-dsl/runtime` | [`packages/runtime/test/PROMPT.md`](packages/runtime/test/PROMPT.md) | retry matrix, pagination, abort, `FhirRequestError` shape |
| `@fhir-dsl/smart` | [`packages/smart/test/PROMPT.md`](packages/smart/test/PROMPT.md) | SMART App Launch v2, PKCE, backend services JWT, scope parser |
| `@fhir-dsl/terminology` | [`packages/terminology/test/PROMPT.md`](packages/terminology/test/PROMPT.md) | registry, ValueSet compose + expansion, CodeSystem hierarchy |
| `@fhir-dsl/types` | [`packages/types/test/PROMPT.md`](packages/types/test/PROMPT.md) | compile-only `*.test-d.ts` coverage of base FHIR types |
| `@fhir-dsl/utils` | [`packages/utils/test/PROMPT.md`](packages/utils/test/PROMPT.md) | `naming`, `type-mapping`, `logger` |

## Workflow

1. Hand the target prompt to a coding-capable AI. The prompt tells it which files to read,
   what the existing coverage is, what scenarios to cover, and where to write tests.
2. The model writes new tests under `packages/<pkg>/test/`. Existing colocated tests in
   `packages/<pkg>/src/` are not touched unless explicitly extending them.
3. Before accepting the model's work, run all three gates from the repo root:

   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

   All three must be green. No skipped tests without a documented reason.

## Where tests live

`vitest.config.ts` already picks up both locations:

- `packages/*/src/**/*.test.ts` — colocated tests (existing style).
- `packages/*/test/**/*.test.ts` — separate `test/` dir (home for AI-written tests + these prompts).
- `packages/*/test/**/*.test-d.ts` — type-level tests (compiled with `tsconfig.test.json`).

No vitest config change is needed to adopt the separate `test/` dir.

## Conventions each prompt enforces

- Vitest with `globals: true`. Biome for lint/format. Strict TS.
- No emojis in source or tests.
- Prefer real behavior over mocks (e.g. run the real emitters and assert on emitted strings).
  Mock only at external boundaries — `fetch`, `fs`, timers.
- No snapshot tests without a meaningful assertion alongside them.
- Do not duplicate scenarios already covered by colocated tests — the prompts list existing
  coverage so the model can fill gaps rather than re-write.
- No source refactors, no API changes, no new runtime dependencies, no tests that hit real
  FHIR servers. Devtime-only deps (e.g. `msw`) are fine if the prompt allows them.

## Gates (what a run must satisfy)

| Gate | Command | Purpose |
|---|---|---|
| Unit + type tests | `pnpm test` | All vitest files green, including `*.test-d.ts` |
| Lint / format | `pnpm lint` | Biome clean |
| Typecheck | `pnpm -r typecheck` | Every workspace package typechecks in isolation |

If a model produces changes that break any of these, the work is not done.

## Out of scope for these prompts

- No production code changes. If a test surfaces a real bug, file it separately — the
  prompt's job is coverage, not refactoring.
- No new CI config, no new scripts. The three gates above exist already.
- No hitting real FHIR servers. Fixtures and mocked `fetch` only.
