---
sidebar_position: 3
title: "US Core Compliance"
description: "Query US Core MustSupport elements with profile narrowing and a validation pipeline that catches non-conformant resources before they reach your UI."
---

# US Core Compliance

## Problem

The ONC certification rules require US Core profiles, which add
MustSupport cardinality constraints on top of base FHIR. If your code
assumes `Patient.gender` is present (MustSupport) but the server returns
a Patient without one, you need to surface the problem, not silently
render `undefined`. Profile narrowing + client-side validation gives
you both a tighter TypeScript shape and a runtime guard.

## Prerequisites

- Generated client with a US Core IG:
  `fhir-gen generate --version r4 --out ./src/fhir --ig hl7.fhir.us.core@6.1.0 --validator native`
- Packages: `@fhir-dsl/core`
- Server: emits `meta.profile` on US Core resources and supports
  `_profile` search-param filtering

## Steps

### 1. Create the client with the generated schema registry

The generator emits validators under `./fhir/r4/schemas/` conforming to
Standard Schema v1. Wire them into the client as `schemas` on
`FhirClientConfig` so `.validate()` has something to call.

```ts
import { createFhirClient } from "@fhir-dsl/core";
import { schemas } from "./fhir/r4/schemas/index.js";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
  schemas,
});
```

### 2. Narrow to the `us-core-patient` profile

The second argument to `search()` is a generated profile name literal.
It swaps the `Prof` type parameter so field access uses the profile's
cardinality (e.g. `gender` becomes required) and `_profile` is filtered
on the wire.

```ts
const page = await fhir
  .search("Patient", "us-core-patient")
  .where("family", "eq", "Jones")
  .execute();

// TypeScript: `p.gender` is FhirCode (required), not FhirCode | undefined
for (const p of page.data) {
  console.log(p.gender, p.identifier[0]?.value);
}
```

### 3. Run client-side validation with `.validate()`

`.validate()` on a search is lazy — nothing happens until `execute()`.
Each match-mode resource passes through the profile-level schema (or
resource-level schema when no profile is selected).

```ts
import { ValidationError } from "@fhir-dsl/core";

try {
  const page = await fhir
    .search("Patient", "us-core-patient")
    .where("family", "eq", "Jones")
    .validate()
    .execute();
  return page.data;
} catch (e) {
  if (e instanceof ValidationError) {
    for (const issue of e.issues) {
      console.error(issue.path?.join("."), "—", issue.message);
    }
    throw e;
  }
  throw e;
}
```

### 4. Select only MustSupport fields (`_elements`)

US Core MustSupport means "render these when present". Pair profile
narrowing with `select()` to both ask the server for only those fields
and narrow the TypeScript shape through `ApplySelection<Prof, Sel>`.

```ts
const page = await fhir
  .search("Patient", "us-core-patient")
  .select(["id", "identifier", "name", "gender", "birthDate", "address", "telecom"])
  .where("family", "eq", "Jones")
  .execute();

// page.data: Array<Pick<USCorePatient, "resourceType" | "id" | ... >>
```

### 5. Fall back to server-side `$validate` for writes

Before creating or updating a resource you're about to send to the
server, ask the server to validate it against the profile. This catches
vendor-specific terminology bindings your local validator can't see.

```ts
const outcome = await fhir.operation("$validate", {
  scope: { kind: "type", resourceType: "Patient" },
  parameters: {
    resource: {
      resourceType: "Patient",
      meta: {
        profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
      },
      identifier: [{ system: "http://hospital.example/mrn", value: "MRN-42" }],
      name: [{ family: "Doe", given: ["Jane"] }],
      gender: "female",
      birthDate: "1990-05-15",
    },
    mode: "create",
  },
}).execute();
// outcome is an OperationOutcome — inspect .issue for errors/warnings
```

## Final snippet

```ts
import { createFhirClient, ValidationError } from "@fhir-dsl/core";
import { schemas } from "./fhir/r4/schemas/index.js";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
  schemas,
});

export async function searchConformantPatients(family: string) {
  try {
    const page = await fhir
      .search("Patient", "us-core-patient")
      .select(["id", "identifier", "name", "gender", "birthDate", "address", "telecom"])
      .where("family", "eq", family)
      .validate()
      .execute();

    return page.data;
  } catch (e) {
    if (e instanceof ValidationError) {
      console.error("Non-conformant US Core response:", e.issues);
    }
    throw e;
  }
}

export async function validateBeforeWrite(resource: unknown) {
  return fhir.operation("$validate", {
    scope: { kind: "type", resourceType: "Patient" },
    parameters: { resource, mode: "create" },
  }).execute();
}
```

## Troubleshooting

- **`ValidationUnavailableError` at `execute()`** → you forgot to pass
  `schemas` in `FhirClientConfig`. The registry resolution happens at
  the moment you call `execute()`, not at builder construction.
- **`.validate()` passes locally but server `$validate` fails** → your
  local native/zod schema validates structure; the server also checks
  terminology bindings. Trust the server for terminology.
- **Gender isn't narrowed to required** → you probably dropped the
  profile argument: `search("Patient")` vs. `search("Patient",
  "us-core-patient")`. The generator only swaps `Prof` when the profile
  literal is supplied.
- **Too many `_elements` fields rejected** → some servers cap `_elements`
  at 64. Drop non-MustSupport fields or split into two queries.
- **`.validate()` is too slow on large pages** → validation awaits per
  resource; move to `stream()` + manual `validateOne` if throughput
  matters, or switch `--validator zod` → `--validator native` at
  generation time (native is faster on cold starts).
