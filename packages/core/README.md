# @fhir-dsl/core

A fully type-safe FHIR query builder for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Construct FHIR REST queries with compile-time safety for resource types, search parameters, includes, and profiles. No more guessing parameter names or hoping your query string is valid.

## Install

```bash
npm install @fhir-dsl/core @fhir-dsl/types
```

## Setup

### 1. Generate your FHIR types

Before using the query builder, generate typed definitions for your FHIR version and profiles using [`@fhir-dsl/cli`](../cli):

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

This generates a `FhirSchema` type along with typed resources, search parameters, profiles, and a pre-configured client — everything the query builder needs for compile-time safety.

### 2. Create a client

The CLI emits a pre-bound `createClient` for your generated schema — that's the recommended entry point. It calls `createFhirClient<FhirSchema>` under the hood with the schema, search params, includes, and validators all pre-wired:

```ts
import { createClient } from "./fhir/r4"; // generated in step 1

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: "your-token" },
});
```

If you prefer to wire the schema yourself (e.g. when bundling for a web client), `createFhirClient` is exported directly:

```ts
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir";

const fhir = createFhirClient<FhirSchema>({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: "your-token" },
});
```

## Usage

### Search resources

```ts
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data     - Patient[] (typed)
// result.total    - total count from server
// result.included - included resources (typed)
// result.link     - pagination links
// result.raw      - raw Bundle response
```

Every method is fully typed. `where("family", ...)` only accepts valid search parameters for `Patient`, and the operator is constrained to what makes sense for that parameter type (string, token, date, etc.).

### Include related resources

```ts
const result = await fhir
  .search("Patient")
  .where("name", "eq", "Smith")
  .include("general-practitioner")
  .execute();

// result.data     - Patient[]
// result.included - Practitioner[] (inferred from include target)
```

The `include` parameter is typed to only accept valid include paths for the resource, and the included resource type is automatically inferred.

### Narrow returned fields

Use `.select()` to request only specific top-level fields. The result type narrows to match, and the query compiles to FHIR's `_elements` search parameter:

```ts
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .select(["id", "name", "birthDate"])
  .execute();

// result.data[0]: { resourceType: "Patient"; id?: string; name?: HumanName[]; birthDate?: FhirDate }
```

Only top-level element names are accepted (matches the `_elements` spec). `resourceType` is always preserved. Calling `.select()` twice replaces the earlier selection.

### Profile-aware queries

```ts
const vitals = await fhir
  .search("Observation", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .execute();

// vitals.data is typed as USCoreVitalSignsProfile[]
```

When you pass a profile URL as the second argument, the result type narrows to that profile's interface.

### Read a single resource

```ts
const patient = await fhir.read("Patient", "123").execute();
// patient is typed as Patient
```

### Transactions

```ts
const result = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
  })
  .update({
    resourceType: "Patient",
    id: "456",
    name: [{ family: "Smith" }],
  })
  .delete("Observation", "789")
  .execute();
```

### Batch operations

```ts
const result = await fhir
  .batch()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
  })
  .delete("Observation", "789")
  .execute();
```

### Server-side `_filter` via FHIRPath

`.filter()` accepts a raw FHIRPath string or a built `FhirPathExpr` (anything with `.compile(): string`) and emits the FHIR `_filter` search param. Compose typed expressions with `@fhir-dsl/fhirpath` for end-to-end type safety:

```ts
import { fhirpath } from "@fhir-dsl/fhirpath";

const officialFamilyIsSmith = fhirpath<"Patient">("Patient")
  .name.where(($) => $.use.eq("official"))
  .family.eq("Smith");

const result = await fhir
  .search("Patient")
  .filter(officialFamilyIsSmith)
  .execute();
// GET /Patient?_filter=Patient.name.where(use%20%3D%20%27official%27).family%20%3D%20%27Smith%27
```

Not every server supports `_filter`. Check `CapabilityStatement.rest.searchParam` before relying on it. See the [FHIRPath + Query Builder guide](https://awbx.github.io/fhir-dsl/docs/guides/fhirpath-and-queries) for the full pattern catalogue (server `_filter`, post-fetch projection, client filtering, aggregates).

### Errors

Every error from this package extends [`FhirDslError`](https://awbx.github.io/fhir-dsl/docs/guides/error-handling) — pattern-match on `kind`, read structured `context`, and serialise with `toJSON()`:

| Class | `kind` | When |
|---|---|---|
| `FhirRequestError` | `core.request` | Non-2xx HTTP response (`context.status`, `context.statusText`, `context.operationOutcome`) |
| `AsyncPollingTimeoutError` | `core.async_polling_timeout` | `async` polling exceeded `maxAttempts` |
| `ValidationError` | `core.validation` | A resource failed Standard Schema validation; `context.issues` lists every failure |
| `ValidationUnavailableError` | `core.validation_unavailable` | `.validate()` called without a `SchemaRegistry` |

```ts
import { isFhirDslError } from "@fhir-dsl/utils";
import { FhirRequestError } from "@fhir-dsl/core";

try {
  await fhir.read("Patient", "missing").execute();
} catch (err) {
  if (err instanceof FhirRequestError) {
    console.error(err.context.status, err.context.operationOutcome);
  } else if (isFhirDslError(err)) {
    console.error(err.kind, err.context);
  } else {
    throw err;
  }
}
```

Or with the `Result` toolkit, no `try`/`catch`:

```ts
import { tryAsync } from "@fhir-dsl/utils";
const r = await tryAsync(() => fhir.read("Patient", "missing").execute());
if (!r.ok) console.error(r.error.kind);
```

### Compile without executing

Every builder has a `compile()` method that returns the raw query representation without hitting the server:

```ts
const query = fhir
  .search("Observation")
  .where("status", "eq", "final")
  .count(50)
  .compile();

// {
//   method: "GET",
//   path: "Observation",
//   params: [
//     { name: "status", value: "final" },
//     { name: "_count", value: 50 }
//   ]
// }
```

## Design

- **Immutable builders** - Every method returns a new builder instance. Safe to store, fork, and compose.
- **Schema-driven** - All type safety comes from the `FhirSchema` generic, which is generated from actual FHIR StructureDefinitions.
- **No runtime magic** - The builder compiles to plain objects. Bring your own HTTP client or use the built-in fetch executor.

## Search Parameter Operators

| Param Type | Operators |
|---|---|
| `string` | `eq`, `contains`, `exact` |
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq` |
| `uri` | `eq`, `above`, `below` |

## License

[MIT](../../LICENSE)
