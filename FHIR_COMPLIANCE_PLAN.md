# FHIR Compliance Plan

A phased plan to close the gaps identified in the audit of `fhir-dsl` against
the FHIR architectural overview (https://build.fhir.org/overview-arch.html).

Each phase is independently mergeable. Phases are ordered by `value / effort`,
not strict dependency — later phases note where they assume earlier work.

Spec-pillar legend (from the overview page):

- **IM**  Information Model
- **CM**  Conformance Model
- **TX**  Terminology
- **API** Usage / RESTful API
- **DF**  Data Fidelity principle
- **LF**  Layered Framework

---

## Phase 0 — Hygiene & baseline

**Goal.** Stop lying to ourselves. Refresh stale docs, lock in the current
behaviour with tests, and make subsequent phases measurable.

**Tasks.**

- [ ] Delete or regenerate `AUDIT.md`. It claims PATCH, conditional headers,
      retry/backoff, AbortSignal, FHIRPath arithmetic / env vars / `$index` /
      `$total` / `resolve` / `hasValue` are missing — all are implemented.
- [ ] Add an `audit:export-surface` script that walks each package's
      `index.ts`, dumps the public surface, and diffs against a checked-in
      snapshot. Re-run in CI; AUDIT.md is regenerated from the snapshot.
- [ ] Add a `pnpm test:fhir-conformance` task wired to the matrices created
      in later phases (it stays empty here, just the plumbing).
- [ ] In `README.md`, add a "Spec coverage" table that the export-surface
      script populates so we never drift again.

**Exit criteria.** AUDIT.md is either gone or re-derived from code; CI fails
when the export surface drifts without a snapshot update.

---

## Phase 1 — Type-system fidelity (IM, DF)

Cheapest, biggest correctness wins. Type-only changes; no runtime impact.

### 1.1 Branded primitives

**Spec mapping.** IM (primitive datatypes), DF (data fidelity pillar).

**Today.** `FhirDate`, `FhirInstant`, `FhirCode<T>`, `FhirUri`, etc. in
`packages/types/src/primitives.ts:1` are bare aliases of `string` / `number` /
`boolean`. Compile-time has no idea a `dateTime` differs from a `string`.

**Plan.**

- [ ] Convert each primitive to an opaque branded type:
      `type FhirDate = string & { readonly __fhir: "date" }`.
- [ ] Smart constructors in a new `packages/types/src/parse.ts`:
      `parseDate(s: string): FhirDate | ParseError`, etc., regex-validated
      per the FHIR spec's primitive regex table.
- [ ] Update generator emitters (`packages/generator/src/emitter/`) to keep
      using the brand types; no signature changes downstream.
- [ ] Migration: add a one-time `as` cast in `packages/example/src/fhir/`
      smoke tests; downstream consumers get a deprecation note in the
      changelog.

**Exit criteria.** `const d: FhirDate = "not-a-date"` is a type error; round
trip through `parseDate` is required.

### 1.2 Discriminated `value[x]` choice types

**Spec mapping.** IM (choice types), DF.

**Today.** `packages/generator/src/parser/structure-definition.ts:68` flattens
`value[x]` into independent optional fields. The spec forbids setting two
siblings simultaneously; today's types allow it.

**Plan.**

- [ ] In `expandChoiceType`, emit a discriminated union:
      `{ valueQuantity: Quantity } | { valueString: string } | …` merged with
      the rest of the resource via intersection.
- [ ] Add a helper `valueOf(resource)` that returns the active branch +
      its discriminator key.
- [ ] Update FHIRPath generator output so `.value` resolves through the
      union.

**Exit criteria.** Setting both `valueQuantity` and `valueString` on an
`Observation` is a type error.

### 1.3 Primitive `_fieldName` siblings

**Spec mapping.** IM (primitives can carry `id` and extensions via parallel
underscore-prefixed elements).

**Today.** Generator omits the `_field` siblings entirely. Round-tripping any
resource that has primitive extensions (very common in US-Core: `_birthDate`,
`_gender`, etc.) silently drops data.

**Plan.**

- [ ] In `resource-emitter.ts`, for every primitive-typed property `foo`,
      also emit `_foo?: Element` (or `Element[]` for repeating fields).
- [ ] Same for the hand-written datatypes in `packages/types/src/datatypes.ts`.
- [ ] Add a serializer helper `withPrimitiveExtensions()` that the runtime
      uses for round-trip safety.

**Exit criteria.** A US-Core Patient with `_birthDate.extension` parses,
type-checks, and re-serialises byte-identically.

### 1.4 Full `Extension.value[x]` union

**Spec mapping.** IM (extensions).

**Today.** `Extension` in `packages/types/src/datatypes.ts:28` types ~12 of
~40 FHIR `value[x]` variants.

**Plan.**

- [ ] Generate `Extension` from the spec catalog the generator already builds
      (`packages/generator/src/spec/catalog.ts`).
- [ ] Move `Extension` from `packages/types` (hand-written) into the
      generated layer; keep a thin re-export in `packages/types` for
      backwards compatibility.

**Exit criteria.** Every spec-defined `value[x]` is reachable via
`extension.value*`.

---

## Phase 2 — Profile & IG fidelity (CM)

Unblocks real IG usage (US-Core, IPS, IPA, CARIN-BB, etc.). Largest
"unlocks downstream value" payoff.

### 2.1 StructureDefinition slicing

**Spec mapping.** CM (profiles), and the spec's reuse-and-composability
principle.

**Today.** `packages/generator/src/parser/profile.ts:63` literally skips
sliced elements. Typed extensions and typed slices don't exist.

**Plan.**

- [ ] Parse `slicing.discriminator` (path/type/value).
- [ ] Emit slice-named optional fields:
      `Observation.component_systolicBP?: Component`,
      `Patient.extension_usCoreRace?: Extension<UsCoreRace>`.
- [ ] Generate a typed `slice()` accessor that walks the array by
      discriminator at runtime and returns the typed slice.
- [ ] Cover all three discriminator types: `value`, `pattern`, `type`,
      `profile`, `exists`. (Most US-Core uses `value` and `pattern`.)

**Exit criteria.** A US-Core Observation Blood Pressure profile generates a
type with named `component_systolic` / `component_diastolic` slices, and the
runtime accessor returns the right entry.

### 2.2 Typed extensions from IGs

**Depends on.** 2.1.

**Plan.**

- [ ] For every extension StructureDefinition in a loaded IG, emit a
      branded `Extension<"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race">`
      with the typed `value[x]` narrowed.
- [ ] `extension(url)` in FHIRPath builder
      (`packages/fhirpath/src/builder.ts:234`) returns the branded type when
      the URL is a known constant.

**Exit criteria.** `patient.extension("us-core-race").value()` is typed as
the US-Core race extension's value union, not generic `Extension`.

### 2.3 IG manifest as a first-class object

**Spec mapping.** CM (ImplementationGuide resource).

**Today.** `packages/generator/src/generator.ts:320` reduces an IG to a
profile bag.

**Plan.**

- [ ] Parse `ImplementationGuide.global[*]` → a map
      `{ Patient: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient" }`.
- [ ] When `--ig us-core` is passed, default-narrow `Patient` etc. to that
      profile in the generated client.
- [ ] Parse `ImplementationGuide.dependsOn[*]` and load transitive IGs
      (us-core depends on uv-sdc, etc.).
- [ ] Surface IG metadata via `client.ig.us_core.version`.

**Exit criteria.** `pnpm fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0`
narrows `Patient` to `us-core-patient` by default, and pulls in dependencies
without an explicit list.

---

## Phase 3 — Terminology runtime (TX)

### 3.1 First-class terminology operations

**Spec mapping.** TX.

**Today.** Only invokable via untyped `client.operation("$expand", …)`.

**Plan.** Add a typed `client.terminology` namespace in `packages/core`:

- [ ] `expand(valueSet, params)` → typed `ResolvedValueSet`.
- [ ] `validateCode({ valueSet | codeSystem, code, system, display })`
      → typed result.
- [ ] `lookup({ system, code, properties? })` → typed `Parameters` view.
- [ ] `translate({ source, target, code })` → typed result.
- [ ] `subsumes({ system, codeA, codeB })` → typed result.

**Exit criteria.** Each operation has a typed builder + a typed result
shape; integration tests against a public terminology server (e.g.,
`tx.fhir.org`) pass.

### 3.2 Richer terminology model

**Spec mapping.** TX (CodeSystem hierarchy and properties).

**Today.** `packages/terminology/src/model.ts:1` carries only
`{ code, display, system }`.

**Plan.**

- [ ] Extend `CodeSystemModel` to carry `parent`, `child`, `properties`,
      `designations`.
- [ ] Add `is-a`, `descendent-of`, `regex` filter operators in
      `packages/terminology/src/valueset-parser.ts`.
- [ ] Implement `subsumes(systemUrl, a, b)` locally for resolved code
      systems.

**Exit criteria.** US-Core ValueSets that use `is-a` filters resolve
offline; `client.terminology.subsumes()` short-circuits to local data when
the CodeSystem is loaded.

---

## Phase 4 — Conformance loop (CM, API)

### 4.1 CapabilityStatement-driven client

**Spec mapping.** CM, API.

**Today.** `CapabilitiesBuilder`
(`packages/core/src/rest-builders.ts:130`) only fetches `/metadata`.

**Plan.**

- [ ] `FhirClient.fromCapabilities(stmt | url)` returns a narrowed client:
  - disable interactions the server doesn't advertise (e.g., no PATCH on
    `Observation`).
  - narrow per-resource search-param maps to advertised params.
  - prefer profiles listed in `rest.resource[*].supportedProfile`.
  - honor `rest.resource[*].versioning`, `readHistory`, `updateCreate`,
    `conditionalRead`, `conditionalUpdate`, `conditionalDelete` flags.
- [ ] Emit a developer-time warning when calling a disabled interaction
      from a generated client.
- [ ] CLI: `fhir-gen capability <baseUrl> --out <dir>` snapshots the
      server's CapabilityStatement and emits a typed client config.

**Exit criteria.** Pointing the client at a server that doesn't support
PATCH makes `client.patch(...)` unreachable at the type level.

### 4.2 Bundle reference resolution

**Spec mapping.** API (`_include`/`_revinclude`), IM (references).

**Today.** `includeExpressions` is wired in `FhirClientConfig` but no
runtime walks `Bundle.entry[*].fullUrl`. Only the FHIRPath `resolve` op
exists at `packages/fhirpath/src/builder.ts:51`.

**Plan.**

- [ ] Add `resolveReference(bundle, ref)` in
      `packages/runtime/src/bundle.ts`. Walks `entry.fullUrl` first, then
      `entry.resource.id` + `resourceType` to match relative refs.
- [ ] `searchAll()` returns a `ResolvedBundle<T>` with a `.deref(ref)`
      method that returns a typed resource.
- [ ] FHIRPath `resolve()` op (`fhirpath/src/builder.ts:51`) routes
      through the same resolver when an evaluation context Bundle is
      provided.
- [ ] Detect contained resources (`DomainResource.contained`) for `#id`
      refs.

**Exit criteria.** `client.search("Observation").include("subject").resolve()`
returns a list of `[Observation, Patient]` tuples where `Patient` is the
narrowed target type.

---

## Phase 5 — Layered framework (LF)

**Spec mapping.** LF.

**Today.** All 150+ generated resources sit in a flat
`<version>/resources/`. Foundation/Base/Clinical/Financial/Specialized has
zero representation. The "reference upward only" rule is unenforceable.

**Plan.**

- [ ] Extend `ResourceModel` with a `layer` field
      (`Foundation | Base | Clinical | Financial | Specialized`),
      populated from the FHIR spec's resource categorisation table.
- [ ] Emit a `LAYER_OF: Record<ResourceType, Layer>` map and a typed
      `referencesUpwardOf(rt)` helper.
- [ ] Optional ESLint rule (or a `tsc`-time check) that flags a
      generated `Reference<TARGET>` whose `TARGET` is in a strictly lower
      layer than the source. Off by default; users opt in.
- [ ] Emit `compartment` membership too (a Patient / Encounter /
      RelatedPerson / Practitioner / Device compartment map). Useful for
      authorization scoping.

**Exit criteria.** `LAYER_OF.Patient === "Base"`; the lint rule catches
a hand-written downward reference in a fixture test.

---

## Phase 6 — FHIR invariants compiled (DF)

**Spec mapping.** DF, CM.

**Today.** `ElementDefinition.constraint[*].expression` (FHIRPath) is
ignored.

**Plan.**

- [ ] During generation, parse `constraint[*]` (`key`, `severity`,
      `expression`, `human`).
- [ ] Compile each FHIRPath expression with the existing builder
      (`packages/fhirpath`) into a runtime predicate.
- [ ] Wire predicates into the optional Standard Schema validators
      (`packages/generator/src/emitter/schema/`) — both `zod` and
      `native` paths.
- [ ] Surface invariant violations as `OperationOutcome` shapes with
      `severity` mapped from constraint severity.

**Exit criteria.** A Patient with `birthDate` after `deceasedDateTime`
fails validation with the corresponding constraint key (e.g., `pat-1`).

**Risk.** Largest scope phase. Some FHIRPath constraints in core spec
require `%context`/`%resource` correctly bound; rely on Phase 0 test
plumbing.

---

## Phase 7 — CLI surface (developer-facing)

**Today.** `packages/cli/src/commands/` only has `generate.ts`.

**Plan.**

- [ ] `fhir-gen validate <file> [--profile <url>] [--ig <pkg>]`
      validates a JSON resource against generated types + invariants.
- [ ] `fhir-gen capability <baseUrl>` (see 4.1).
- [ ] `fhir-gen scaffold-ig <pkg>` initialises a project with the IG
      pre-wired and a working `client.ts`.
- [ ] `fhir-gen diff <oldVersion> <newVersion>` highlights breaking
      changes between two FHIR versions or two IG versions (uses the
      generator's intermediate model).

**Exit criteria.** Every command has an integration test that runs the
binary in a tmp dir and asserts on its output.

---

## Phase 8 — MCP server generation (LLM bridge)

**Goal.** Generate a Model Context Protocol server from the same spec the
typed client consumes, so an LLM agent can talk to any FHIR upstream
(HAPI, Azure FHIR, AWS HealthLake, Medplum, …) through typed tools and
URIs that already reflect the chosen FHIR version + IG.

**Spec mapping.** API (interactions become tools), CM (CapabilityStatement
narrows the tool surface), TX (terminology ops become tools), DF (the
generator's typed schemas become MCP `inputSchema`/`outputSchema`).

**Depends on.** Phase 4 (CapabilityStatement-driven client) for surface
narrowing; Phase 2 (IG/profile narrowing) for typed bodies; Phase 3
(typed terminology operations) for the terminology tool family. Each is
optional — the MCP layer degrades to base-spec types when the dependency
isn't ready.

**Locked design decisions.**

- ~10 generic verbs typed by discriminated union over `resourceType`,
  not per-resource × per-interaction.
- Read-only by default; writes opt-in via `--writes <list>`.
- All three auth strategies behind a pluggable interface from day one.
- New `packages/mcp` + `--mcp <out>` flag on the generator.
- Both `stdio` and Streamable HTTP transports.
- Tools and MCP resources (URI-addressable reads).
- Pluggable `AuditSink`, default = structured JSON log.
- One server instance = one upstream + one IG (pinned at generate time).

### 8.1 Package skeleton

- [ ] New `packages/mcp/` workspace, depends on `core`, `runtime`,
      `smart`, and `@modelcontextprotocol/sdk`.
- [ ] Exports: `createMcpServer({ client, auth, audit, writes,
      transport })`, `AuthStrategy`, `AuditSink`, `Transport`.
- [ ] Server boot supports `transport: "stdio" | "http"` (Streamable
      HTTP per the SDK), with `http` accepting host/port/cors options.
- [ ] No FHIR types live in this package — they're imported from the
      generator output the consumer wires in.

### 8.2 Generic verb tools

Tool catalog (all schemas are discriminated unions over `resourceType`):

- [ ] `fhir_search` — typed search params per resource.
- [ ] `fhir_read` — `{ resourceType, id }`.
- [ ] `fhir_vread` — `{ resourceType, id, vid }`.
- [ ] `fhir_history` — system / type / instance variants.
- [ ] `fhir_capability` — server CapabilityStatement (typed).
- [ ] `fhir_operation` — typed operations (`$everything`, etc.) by
      `(resourceType?, opName)`.
- [ ] `fhir_terminology_expand`, `fhir_terminology_validate_code`,
      `fhir_terminology_lookup`, `fhir_terminology_translate`,
      `fhir_terminology_subsumes` — first-class tools (Phase 3).
- [ ] **Write tools, gated by `--writes`:** `fhir_create`,
      `fhir_update` (requires `If-Match`), `fhir_patch`,
      `fhir_delete` (requires `If-Match`).
- [ ] Generator emits the discriminated-union schemas into
      `<out>/mcp/schemas.ts`; runtime imports them.

### 8.3 MCP resources

- [ ] URI template `fhir://{resourceType}/{id}` → `client.read(...)`.
- [ ] URI template `fhir://{resourceType}/{id}/_history/{vid}` →
      `vread`.
- [ ] Fixed `fhir://capability` → CapabilityStatement.
- [ ] Fixed `fhir://terminology/ValueSet/{id}/expand` → expansion.
- [ ] Resource list endpoint advertises only the fixed URIs; templates
      are discoverable via the SDK's templated-URI mechanism.

### 8.4 Pluggable auth

- [ ] `AuthStrategy` interface: `getToken(req): Promise<string |
      undefined>`, `onUnauthorized(res): Promise<void>`.
- [ ] `BackendServicesStrategy` — wraps `packages/smart`'s JWT
      flow + token cache.
- [ ] `PatientLaunchStrategy` — accepts a SMART launch context;
      injects launch patient as compartment scope (depends on Phase 5
      compartment metadata for the auto-scoping).
- [ ] `BearerStrategy` — static token from env/config; for dev/CTF.
- [ ] `compose(...strategies)` helper that tries each in order.

### 8.5 Write gating + safety

- [ ] CLI flag `--writes none|create|create,update|all` (default
      `none`).
- [ ] When `update`/`delete`/`patch` is enabled, the tool schema
      *requires* an `ifMatch` field; runtime rejects calls without it.
- [ ] When `PatientLaunchStrategy` is active, every tool input is
      validated against the launch patient's compartment; cross-patient
      writes are rejected at the MCP layer before hitting the upstream.
- [ ] Per-tool deny-list flag `--deny <tool,tool>` for surgical
      lockdown.

### 8.6 Audit sink

- [ ] `AuditSink` interface: `record(event: AuditRecord): void |
      Promise<void>`.
- [ ] `AuditRecord` shape: timestamp, principal, transport, tool,
      resourceType, id, action (`R`/`C`/`U`/`D`/`E`), outcome,
      latencyMs, requestId.
- [ ] Built-in sinks: `JsonLogSink` (default), `OtlpSink` (OTel
      span+attribute mapping), `FhirAuditEventSink` (writes
      `AuditEvent` resources to the upstream when writes are enabled).
- [ ] Every tool call goes through the sink, success or failure.

### 8.7 Token economy defaults

- [ ] `fhir_search` defaults: `_summary=true`, `_count=20`,
      hard cap `_count <= 100`.
- [ ] Per-resource `_elements` whitelist generated from common-fields
      heuristics (configurable per server).
- [ ] Pagination is transparent to the LLM: tool walks up to N pages
      (default 5) and returns a single concatenated bundle plus a
      `truncated` flag — no opaque cursor handed to the model.
- [ ] Strip `Resource.text.div` from responses by default; `--keep-text`
      flag re-enables.

### 8.8 Generator integration

- [ ] `fhir-gen generate --mcp <out>` emits, alongside the typed
      client: `<out>/mcp/schemas.ts`, `<out>/mcp/tools.ts`,
      `<out>/mcp/resources.ts`, `<out>/mcp/server.ts`.
- [ ] `<out>/mcp/server.ts` is a runnable entrypoint: imports the
      generated client, default auth/audit, reads env for upstream URL +
      bearer.
- [ ] When invoked with `--ig hl7.fhir.us.core@6.1.0`, the emitted
      schemas reflect us-core profiles (Patient body type =
      us-core-patient).

### 8.9 CLI ergonomics

- [ ] `fhir-gen mcp serve --base <url> [--ig <pkg>] [--writes <list>]
      [--transport stdio|http] [--port N]` — boots a server using a
      cached generated tree, no separate generate step needed.
- [ ] `fhir-gen mcp inspect --base <url>` — connects to an upstream's
      `/metadata` and prints the tool surface that *would* be generated
      (CapabilityStatement-driven preview).

**Exit criteria.**

- `fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0 --mcp ./mcp-out`
  produces a working `node mcp-out/mcp/server.js` over stdio.
- An MCP client (Claude Desktop or the SDK's test harness) can call
  `fhir_search` against a HAPI dev server with us-core profiles and
  `fhir_read` against `fhir://Patient/123`.
- Writes are disabled by default; enabling `--writes update` makes
  `fhir_update` callable and rejects calls missing `ifMatch`.
- `AuditSink` receives one record per tool call; the default
  `JsonLogSink` prints structured JSON.
- Switching `transport: "stdio"` → `transport: "http"` works without
  code changes to tools or schemas.

**Risk.**

- **PHI funnel.** This package becomes a clinical data exfil surface
  if misconfigured. Default-deny on writes, mandatory audit, and a
  `--profile clinical-readonly|research|full` preset (Phase 8.5
  follow-up) are non-negotiable for v1.
- **Strategic scope.** Shipping this puts fhir-dsl in conversation with
  Medplum/Smile/HAPI MCP work. The boundary is: fhir-dsl generates the
  bridge, it doesn't host it. Hosting is consumer-side.
- **Tool-count creep.** Adding per-IG sugar tools later will pressure
  the ~10-verb cap. Hold the line; route IG-specific behaviour through
  schemas, not new tools.

---

## Tracking

- One issue per checkbox. Tag with `phase-N` and the spec pillar.
- Each phase opens with a tracking issue that references its checkboxes
  and exit criteria.
- Each PR closes the box it addresses; `audit:export-surface` snapshot
  diff is part of the PR body.
- After a phase ships: bump `pnpm version:bump` (minor for new pillars,
  patch for fidelity-only fixes), regenerate the spec coverage table.

### Shipped phases

| Version | Phase | Notes |
|---|---|---|
| v0.23.0 | 1.1 | Branded primitives via `unique symbol` markers |
| v0.24.0 | 1.2 | `ChoiceOf<T, Prefix>` + `choiceOf()` runtime helper |
| v0.25.0 | 1.3 + 1.4 | `_field` siblings, full `Extension.value[x]` union (49 variants) |
| v0.26.0 | 3.1 | Typed terminology operations on `client.terminology.*` |
| v0.27.0 | 4.1 | `createCapabilityGuard` for capability-narrowed clients |
| v0.28.0 | 3.2 | Concept hierarchy + `is-a` / `descendent-of` / `regex` ValueSet filters |
| v0.29.0 | 4.2 | `Bundle.resolveReference` / `resolveReferences` runtime helpers |
| v0.30.0 | 5 | Layered framework: `LAYER_OF`, `referencesUpward` |
| v0.32.0 | 7.2 | `fhir-gen capability <baseUrl>` |
| v0.33.0 | (audit) | Export-surface snapshot in CI |
| v0.34.0 | 2.3 | IG manifest (`global`, `dependsOn`) parsing |
| v0.35.0 | 7.1 | `fhir-gen validate` |
| v0.36.0 | 7.3 | `fhir-gen scaffold-ig` |
| v0.37.0 | 7.4 | `fhir-gen diff` (exits 2 on breaking changes) |
| v0.38.0 | 2.1 | StructureDefinition slicing parse + emit + runtime helpers |
| v0.39.0 | 2.2 | Branded `Extension<URL>` + IG extension SD parsing |
| v0.40.0 | 6 | FHIRPath invariant evaluator (subset) |
| v0.41.0 | 8.1 | `@fhir-dsl/mcp` package skeleton |
| v0.42.0 | 8.2 | MCP generic verb runners (read/search/etc. against upstream) |
| v0.43.0 | 8.3 | MCP `resources/read` (URI-addressable get-by-id) |
| v0.44.0 | 8.5 | Write gating + safety (dryRun, confirmWrites, write-resource-types) |
| v0.45.0 | 8.7 | Token economy defaults (`_count`, `_summary`, byte cap) |
| v0.46.0 | 8.9 | `fhir-gen mcp` CLI command |
| v0.47.0 | 8.8 | Generator `--mcp <out>` scaffold emission |
| v0.48.0 | 8.4 | Backend-services + patient-launch auth via `@fhir-dsl/smart` |

### Remaining

- Phase 6 follow-up — wire compiled invariants into emitted Standard Schema validators (extract `ElementDefinition.constraint[*]` at generate time, run `compileInvariant`, thread into the zod/native validator output)
- Phase 8 — Streamable HTTP transport (the package ships only stdio today; the spec also defines an HTTP transport, useful for hosted deployments)

## Out of scope (intentionally)

- A full FHIR server. fhir-dsl is a typed client + generator; server
  semantics belong in a separate package.
- HL7 v2 / CDA bridging.
- A GraphQL adapter on top of search.
- OIDC ID-token verification beyond what SMART v2 already does
  (consumer boundary).
