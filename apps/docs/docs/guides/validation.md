---
id: validation
title: Runtime Validation
description: Validate resources against generated Standard Schema validators — with FHIRPath invariants, profile narrowing, and structured Issue diagnostics.
sidebar_label: Validation
---

# Runtime Validation

fhir-dsl generates TypeScript *types* by default. Types catch mistakes at compile time, but they can't check that an incoming JSON payload from a FHIR server, a webhook, or a form layer actually conforms to the shape you expect. That's what the validation layer is for.

Passing `--validator <target>` emits a parallel `schemas/` tree of runtime validators alongside the types. Every exported schema conforms to [**Standard Schema V1**](https://standardschema.dev/) -- a tiny library-agnostic interface co-designed by the authors of Zod, Valibot, and ArkType. Consumers validate via a single `schema["~standard"].validate(value)` call, so switching validator libraries later never touches your call sites.

:::info Client-side `.validate()` vs server-side `$validate`

Two different validations ship under similar names. The page below is about the **client-side** one.

| | `.validate()` | `$validate` |
|---|---|---|
| Runs where | Locally, in your process | On the FHIR server |
| What it checks | Generated Standard Schema (types + bindings + profile cardinality) | Whatever the server decides — terminology, invariants, references, business rules |
| How to call | Chained on a builder: `client.read(...).validate().execute()` | FHIR operation: `client.operation("$validate", { resource: { Type: "Patient" }, body })` (FHIR R5 §3.1.0.8) |
| Returns | Typed value or throws `ValidationError` | Server-emitted `OperationOutcome` |
| Network | None | One POST per call |

Use `.validate()` to harden your own process against bad upstream data at zero network cost. Use `$validate` when a server is the source of truth (terminology servers, conformance testing, pre-commit validation against an IG). They're complementary, not alternatives.
:::

## Enabling validation

Pass `--validator` when generating:

```bash
fhir-gen generate \
  --version r4 \
  --out ./src/fhir \
  --expand-valuesets \
  --validator native
```

`--validator` accepts:

| Target | Runtime dep | When to pick it |
|---|---|---|
| `native` | None (emits a ~170-line runtime file) | Default choice. Zero deps, fastest cold start, works everywhere. |
| `zod` | `zod` (peer) | You already use Zod elsewhere, or want its richer error messages and ecosystem. |

Both targets produce Standard Schema-compatible output. Your call sites look identical:

```ts
import { PatientSchema } from "./fhir/r4/schemas";

const result = await PatientSchema["~standard"].validate(incoming);
if (result.issues) {
  // structured issues: [{ message, path }]
  console.error(result.issues);
} else {
  const patient = result.value; // typed Patient
}
```

## What gets validated

### FHIR primitives

Every primitive in R4 is emitted with its spec-defined regex and bounds. `id` matches `/^[A-Za-z0-9\-.]{1,64}$/`, `instant` enforces ISO 8601 with timezone, `positiveInt` requires `>= 1`, etc.

### ValueSet bindings

When a field has a **required** binding (`Patient.gender`, `Observation.status`), the schema enforces the exact set of codes from the resolved ValueSet. Bad codes fail with `expected one of: male, female, other, unknown`.

For **extensible** bindings (open-world by default), the schema accepts any string but types the known values as a literal union. Pass `--strict-extensible` to treat extensible bindings as closed sets too.

Bindings on `Coding` and `CodeableConcept` emit inline objects that narrow the `code` field to the bound value set while leaving `system`, `display`, `version`, and `text` free.

### Cardinality and required fields

`minItems: 1` is enforced for required arrays. Required scalar fields fail validation when missing.

### FHIRPath invariants

Every `ElementDefinition.constraint[*]` from the spec or your IG -- root-level (`dom-3`, `dom-6`, etc.) and backbone-level (`pat-1` on `Patient.contact`, `obs-7` on `Observation`, ...) -- is wired into the emitted schema automatically. Each schema with constraints is wrapped in `s.refine(...)` (native) or `.superRefine(...)` (zod) that calls `validateInvariants` from `@fhir-dsl/fhirpath` after structural validation succeeds. Errors surface as Standard Schema issues; `severity: "warning"` constraints are filtered out so they don't fail validation but remain reported by `validateInvariants` directly.

```ts
// A Patient.contact with no name/telecom/address/organization fails pat-1.
const result = await PatientSchema["~standard"].validate({
  resourceType: "Patient",
  contact: [{}], // <-- violates pat-1
});
// result.issues[0].message → "pat-1: SHALL at least contain a contact's details ..."
```

Generated projects need `@fhir-dsl/fhirpath` as a runtime dep. Opt out with `fhir-gen generate --validator native --no-invariants` if you don't want the dependency.

### Profiles

When you pass `--ig hl7.fhir.us.core@6.1.0` alongside `--validator`, the generator also emits `schemas/profiles/<slug>.schema.ts`, one per profile, each extending the base resource schema with the profile's tighter cardinality and bindings.

```ts
import { USCorePatientProfileSchema } from "./fhir/r4/schemas/profiles/uscore-patient-profile.schema.js";

// Fails: base Patient passes, but US Core requires identifier[] with minItems=1.
const result = await USCorePatientProfileSchema["~standard"].validate(patient);
```

A `ProfileSchemaRegistry` object indexes every profile schema by base resource + slug, so you can dispatch generically:

```ts
import { ProfileSchemaRegistry } from "./fhir/r4/schemas/profiles";

const schema = ProfileSchemaRegistry.Patient["us-core-patient"];
const result = await schema["~standard"].validate(patient);
```

## Generated layout

```
src/fhir/r4/schemas/
  __runtime.ts                          # native adapter only: ~170-line Standard Schema impl
  datatypes.ts                          # HumanName, Coding, Reference, Extension, …
  terminology.ts                        # AdministrativeGenderSchema, …
  resources/
    index.ts
    patient.schema.ts                   # PatientSchema
    observation.schema.ts
    …
  profiles/                             # only with --ig
    index.ts
    uscore-patient-profile.schema.ts
    profile-schema-registry.ts
  index.ts                              # re-exports everything
```

The `native` adapter additionally emits `__runtime.ts` (the Standard Schema implementation) into `schemas/`. It has no external dependencies -- you can vendor, audit, or copy it freely.

## Why Standard Schema

A year ago, picking a validator locked you in: call sites referenced `z.infer`, `yup.InferType`, or `type.infer` directly. [Standard Schema V1](https://standardschema.dev/) is a 60-line spec that decouples "which library emitted this" from "how do I validate." Every conforming schema exposes `~standard.validate(value) => { value } | { issues }`. Zod >= 3.24, Valibot, and ArkType all implement it natively.

This means: if you start with `--validator native` today and want to migrate to Zod's tooling later, regenerate with `--validator zod` and your application code keeps working. No refactor, no codemod.

## Using with the query builder

The builder has a `.validate()` chain method. When chained before `.execute()`, each returned resource is validated against its generated schema before the promise resolves; validation failures surface as a thrown `ValidationError`. No hand-written post-hoc loops, no schema imports at the call site.

**Prerequisite:** the client must have schemas wired in. The generated `createClient()` does this for you when you generate with `--validator native` (or `zod`). If the client has no schemas, `.validate()` throws `ValidationUnavailableError` immediately — fail-fast, not at response time.

### `read` -- a single resource

```ts
import { createClient } from "./fhir/r4";

const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });

// Throws ValidationError if HAPI returns a non-conformant Patient.
const patient = await fhir.read("Patient", "example").validate().execute();
// patient is a typed, structurally-verified Patient
```

### `search` -- validate every hit

Every entry in `data[]` is validated. Included resources (from `_include` / `_revinclude`) are left as-is since they can be any resource type.

```ts
const res = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .count(10)
  .validate()
  .execute();
// res.data: validated Patient[]
```

`.stream()` validates the same way — each yielded resource is checked before it reaches your consumer.

### Profile-aware search

Pass a profile canonical URL to `.search()` and the data is narrowed to the profile's TypeScript shape. `.validate()` picks up the profile schema automatically — the base resource schema never runs in this case:

```ts
const res = await fhir
  .search("Patient", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
  .where("family", "eq", "Smith")
  .validate()
  .execute();
// Each res.data[i] is validated against the US Core Patient profile schema.
```

### Handling validation errors

```ts
import { ValidationError, ValidationUnavailableError } from "@fhir-dsl/core";

try {
  const res = await fhir.search("Patient").validate().execute();
} catch (e) {
  if (e instanceof ValidationUnavailableError) {
    // Regenerate with `--validator native|zod`
  } else if (e instanceof ValidationError) {
    console.error(`${e.resourceType}[${e.index}]: ${e.message}`, e.issues);
  } else {
    throw e;
  }
}
```

`ValidationError` exposes `resourceType`, `issues` (Standard Schema issue list with `message` + `path`), and `index` (the offending position in `data[]` for searches; `undefined` for reads).

### Using the schemas directly

For cases where `.validate()` doesn't fit — ingesting a webhook payload, checking a file before persisting, validating a hand-built resource — import the schema and call its Standard Schema interface:

```ts
import { PatientSchema } from "./fhir/r4/schemas";

const result = await PatientSchema["~standard"].validate(incoming);
if (result.issues) {
  console.error(result.issues);
} else {
  const patient = result.value; // typed Patient
}
```

Profiles dispatched at runtime use `ProfileSchemaRegistry`:

```ts
import { ProfileSchemaRegistry } from "./fhir/r4/schemas/profiles";

const schema = ProfileSchemaRegistry.Patient[profileSlug];
const r = await schema["~standard"].validate(patient);
```

### Transactions and batches

`.transaction()` and `.batch()` return a raw `Bundle` response. Validate entries directly off `bundle.entry[].resource` against the appropriate resource schema if you need to confirm what the server persisted.

### Should I validate everything?

Usually not. Validation is non-trivial work -- on a cold path (webhooks, file imports, unknown-source payloads) it's a clear win; on hot paths where you trust the upstream server, it's overhead. A common pattern: validate at system boundaries (ingress, untrusted JSON), trust typed results everywhere else. `.validate()` is opt-in per call, so you can pick without committing globally.

## Example: validating a HAPI response

Using the query builder — one chain, structured errors, no schema imports at the call site:

```ts
import { createClient, ValidationError } from "@fhir-dsl/core";
import { createClient as makeFhir } from "./fhir/r4";

const fhir = makeFhir({ baseUrl: "https://hapi.fhir.org/baseR4" });

try {
  const res = await fhir.search("Patient").count(1).validate().execute();
  console.log(res.data[0]?.name?.[0]?.family);
} catch (e) {
  if (e instanceof ValidationError) {
    for (const issue of e.issues) {
      console.error(`${issue.path?.join(".") ?? "(root)"}: ${issue.message}`);
    }
  }
  throw e;
}
```

## CLI reference

| Flag | Description |
|---|---|
| `--validator <target>` | `native` or `zod`. Omit to skip schema emission entirely. |
| `--strict-extensible` | Treat extensible bindings as closed enums. Off by default. |

Both flags are additive -- they don't change what gets emitted for types or search parameters, only whether the `schemas/` tree is produced.
