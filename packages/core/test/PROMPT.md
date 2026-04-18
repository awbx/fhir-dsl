# Test Prompt: `@fhir-dsl/core`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/core` — the fhir-dsl query-builder DSL — to production-grade
coverage using **vitest**. No source changes. No new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR query builder + code generator monorepo
inspired by Kysely. `@fhir-dsl/core` is the DSL core: an immutable
`FhirClient`, fluent search/read builders, transactions/batches, auth, and
runtime validation via Standard Schema V1. Every builder method returns a new
instance — immutability is a load-bearing invariant.

## Package brief

Public surface (re-exported from `packages/core/src/index.ts`):

- `createFhirClient(config)` → `FhirClient<Schema>` (`fhir-client.ts`).
- `SearchQueryBuilder` / `ReadQueryBuilder` interfaces (`query-builder.ts`)
  and their impls (`search-query-builder.ts`, `read-query-builder.ts`).
- `TransactionBuilder`, `BatchBuilder` (`transaction-builder.ts`).
- `CompiledQuery` (`compiled-query.ts`), HTTP helpers (`http.ts`),
  `AuthConfig` (`auth.ts`), `FhirSchema` + selection helpers (`types.ts`).
- `SchemaRegistry`, `ValidationError`, `ValidationUnavailableError`,
  `validateOne`, `resolveSchema`, `profileSlugFromUrl` (`validation.ts`).

### Files to read first

1. `packages/core/src/index.ts`
2. `packages/core/src/fhir-client.ts`
3. `packages/core/src/search-query-builder.ts`
4. `packages/core/src/read-query-builder.ts`
5. `packages/core/src/transaction-builder.ts`
6. `packages/core/src/validation.ts`
7. `packages/core/src/types.ts` (selection / profile inference types)
8. All existing `*.test.ts` in `packages/core/src/`

## Existing coverage (do not duplicate)

- `fhir-client.test.ts` — createClient + baseUrl handling.
- `search-query-builder.test.ts` — where, sort, include, revInclude, compile, execute.
- `read-query-builder.test.ts` — compile/execute.
- `transaction-builder.test.ts` — bundle assembly.
- `auth.test.ts` — auth header application.
- `validate.test.ts` — `.validate()` chain on search + read.
- `select.test.ts` / `select.test-d.ts` — selection runtime + type narrowing.
- `types.test.ts` — type-level assertions on registry shapes.

Fill gaps, don't re-assert the above.

## Coverage gaps to fill

Write tests in `packages/core/test/`. Use `*.test-d.ts` for compile-only
type assertions (picked up by vitest's typecheck integration).

### Runtime behavior

1. **baseUrl normalization.** Trailing slash present / absent, `/fhir` suffix
   present, path segments in `baseUrl` (e.g. `https://host/fhir/r4`) — all
   produce a correct absolute request URL with no doubled slashes.
2. **Header merge.** `config.headers` merges with the default
   `Accept: application/fhir+json` and `Content-Type` without clobbering
   user overrides (user wins on key collision).
3. **`config.fetch` override.** A custom fetch is used when provided; default
   `globalThis.fetch` is used otherwise.
4. **Auth application.** `bearer`, `basic`, custom `provider` — each attaches
   the right `Authorization` value. A provider that throws surfaces that
   error to the caller.
5. **Search `.where(...)` matrix.** For each search-param `type` (`string`,
   `token`, `date`, `number`, `quantity`, `reference`, `uri`, `composite`,
   `special`) — the correct prefixes are accepted, and the URL encodes
   `system|code` for tokens, `ge`/`le` etc. for dates.
6. **Search chain immutability.** Every chain method returns a new builder;
   the original is unchanged, and two builders branched off a common root
   do not share state (mutating one does not affect the other).
7. **Order independence of chain methods.** `.where(...).sort(...)` produces
   the same compiled URL as `.sort(...).where(...)`.
8. **Search includes / revIncludes.** Multiple `.include()` calls accumulate;
   duplicates deduplicate; `_include` vs `_revinclude` render with the right
   prefix.
9. **Execute result shape.** `.execute()` returns `{ data, included, total, links, raw }`.
   `data` contains entries with `search.mode !== "include"`; `included` holds
   `search.mode === "include"`. `total` and `links` come from the Bundle.
10. **`.stream()`** pages via the `next` link until it's absent, yields each
    resource once, and honors an `AbortSignal`.
11. **`read.execute()`** hits `GET <baseUrl>/<type>/<id>` exactly once.
12. **Transaction / batch.** Each adds entries with the correct `request.method`
    and `fullUrl`; `.execute()` POSTs the bundle with `type: "transaction"` /
    `"batch"`.
13. **`.validate()` on builders.** (Already tested in `validate.test.ts`.)
    Extend to: streaming validates each yielded resource; profile dispatch
    with a slug that isn't in the registry throws `ValidationError` whose
    message names the missing slug.
14. **`ValidationError` fields.** `resourceType`, `index`, `issues[].path`,
    `issues[].message` are all populated as documented.
15. **`profileSlugFromUrl`** — handles canonical, versioned (`|4.0.1`), and
    malformed inputs defensively.

### Type-level (compile-only)

Put these in `packages/core/test/*.test-d.ts`:

1. `ApplySelection<Patient, ["name", "gender"]>` keeps only those fields and
   `resourceType`.
2. `ResolveProfile<Schema, "Patient", "us-core-patient">` resolves to the
   profile type when the profile exists, and to the base resource otherwise.
3. `SearchParamFor<Schema, "Patient">` only autocompletes Patient's search
   params (not globally-defined ones bound to other resources).
4. `IncludeFor<Schema, "Patient">` and `RevIncludeFor<Schema, "Patient">`
   contain the right canonical strings.
5. `.where("nope", ...)` on a resource that lacks that param fails to
   compile (use `@ts-expect-error`).

## Research directives

- FHIR Search spec: <https://www.hl7.org/fhir/R4/search.html> (search parameter
  types, prefixes, modifiers, `_include`, `_revinclude`, `_has`, chaining).
- Standard Schema V1 spec: <https://standardschema.dev/> — especially the
  `~standard.validate` result shape and issue format.
- FHIR Bundle / transaction semantics:
  <https://www.hl7.org/fhir/R4/bundle.html> — request.method, fullUrl rules,
  `type: "transaction"` vs `"batch"`.
- Fetch `AbortSignal` semantics:
  <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal>.

## Conventions

- vitest `globals: true`; keep imports explicit if it matches existing style.
- No network. Pass a custom `fetch` mock via `config.fetch` and assert on the
  captured calls.
- No snapshot tests without a paired semantic assertion.
- Use `@ts-expect-error` for negative type cases in `*.test-d.ts`.

## Workflow

1. Read the listed source and existing test files.
2. Write behavioral tests in `packages/core/test/*.test.ts` and type-level
   tests in `packages/core/test/*.test-d.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```
4. Iterate until green.

## Success criteria

- Every scenario above has at least one `it(...)` or `expectTypeOf` assertion.
- No source file under `packages/core/src/` is modified.
- All three gates green.

## Out of scope

- Refactoring the builders or the type algebra.
- Adding new auth types.
- Tests that hit a real FHIR server.
