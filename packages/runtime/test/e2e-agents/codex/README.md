# codex Client E2E Suite

## Architecture

This suite tests the public client API through `@fhir-dsl/core` from a `packages/runtime` test namespace.

It uses:

- a hand-rolled mini schema in `schema.ts`
- a scripted in-memory `fetch` recorder in `mock-fetch.ts`
- runtime e2e tests in `client.e2e.test.ts`
- type-level tests in `client-types.test-d.ts`

I chose a hand-rolled schema instead of reusing the generator golden bundle because the generator fixture does not expose enough search-param variety to cover every operator family, composite params, multiple include targets, reverse includes, and profile narrowing in one compact suite.

The mock fetch approach keeps the tests deterministic while still proving the real request shape, headers, pagination URLs, and response parsing behavior end to end.

## How To Run

```bash
pnpm vitest run packages/runtime/test/e2e-agents/codex/
```

Type-only checks:

```bash
pnpm vitest run --typecheck packages/runtime/test/e2e-agents/codex/client-types.test-d.ts
```

## Coverage

- construction and injected `fetch`
- `.where()` across string, token, date, number, quantity, reference, and uri params
- terminology-narrowed token values
- `.whereComposite()`
- `.include()` and `.revinclude()` typed included resources
- `.whereChained()` and `.has()`
- `.sort()`, `.count()`, `.offset()`
- `.compile()` and `.execute()`
- `.stream()` single-page, multi-page, and abort behavior
- `read()`
- `transaction()` create/update/delete and missing-id guard
- `FhirRequestError` error paths for JSON and non-JSON bodies
- bearer auth, basic auth, header merging, `Accept`, `Content-Type`
- absolute pagination URL execution
