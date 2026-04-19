---
sidebar_position: 6
title: "Validation Pipeline"
description: "Combine client-side Standard Schema v1 validation, server-side $validate, and Zod-or-native validator selection into one pipeline."
---

# Validation Pipeline

## Problem

FHIR resources flow through three different trust boundaries: data your
server sends back, data your code is about to write, and data coming from
an upstream integration. Each wants a different validation pass. This
recipe wires all three using the same Standard Schema v1 surface — your
generated validator runs client-side for reads/writes, and `$validate`
asks the server to re-check terminology.

## Prerequisites

- Generated client at `./fhir/r4` with `--validator native` or
  `--validator zod`
- Packages: `@fhir-dsl/core`
- Server: must implement `$validate` (HAPI does; most production servers
  do). Client-side validation works against any server.

## Steps

### 1. Generate validators

Choose native (zero-dep, small bundle) or zod (ecosystem interop):

```bash
# Zero-dep, smaller bundle — good for serverless
fhir-gen generate --version r4 --out ./src/fhir --validator native

# Zod, integrates with .refine() chains
fhir-gen generate --version r4 --out ./src/fhir --validator zod
```

Both emitters conform to Standard Schema v1, so the `FhirClient` uses
them interchangeably.

### 2. Wire the schemas on the client

`FhirClientConfig.schemas` takes a `SchemaRegistry`. The generator
exports one from `./fhir/r4/schemas/index.ts` keyed by resource type
and profile id.

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

### 3. Validate on read

`.validate()` is a lazy builder method; it runs at `execute()` time,
resource-by-resource, and throws `ValidationError` on the first
non-conformant match entry.

```ts
import { ValidationError, ValidationUnavailableError } from "@fhir-dsl/core";

try {
  const patient = await fhir.read("Patient", "example").validate().execute();
  // ... use typed patient
} catch (e) {
  if (e instanceof ValidationError) {
    for (const issue of e.issues) {
      console.error(issue.path?.join("."), "—", issue.message);
    }
  } else if (e instanceof ValidationUnavailableError) {
    console.error("No schema registry configured");
  } else {
    throw e;
  }
}
```

### 4. Validate on search results

Same surface. `.validate()` on a search iterates every match entry;
included-mode entries are skipped (validate those separately if needed).

```ts
const page = await fhir
  .search("Observation")
  .where("code", "eq", "8480-6")
  .count(50)
  .validate()
  .execute();
```

### 5. Interpret `StandardValidateResult` issues directly

If you want to validate a resource you constructed locally (without a
server round-trip), pull the schema out of the registry and call it
yourself. `StandardSchemaLike["~standard"].validate` returns either
`{ value }` on success or `{ issues }` on failure.

```ts
import { resolveSchema, validateOne, ValidationError } from "@fhir-dsl/core";
import { schemas } from "./fhir/r4/schemas/index.js";

const schema = resolveSchema(schemas, "Patient");
if (schema) {
  try {
    const validPatient = await validateOne(schema, {
      resourceType: "Patient",
      id: "local-1",
      name: [{ family: "Doe" }],
      gender: "female",
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      for (const { message, path } of e.issues) {
        console.error(`${(path ?? []).join(".") || "<root>"}: ${message}`);
      }
    }
  }
}
```

`validateOne` awaits the Standard Schema v1 result and throws
`ValidationError` on any issues; the `issues` list is readonly and each
entry carries `{ message, path? }`.

### 6. Server-side `$validate` for writes

Local validators check structure and cardinality. Terminology bindings
live on the server — a code your local schema accepts may not be in the
ValueSet the server enforces. Ask the server before writing.

```ts
const outcome = await fhir.operation("$validate", {
  scope: { kind: "type", resourceType: "Patient" },
  parameters: {
    resource: {
      resourceType: "Patient",
      name: [{ family: "Doe", given: ["Jane"] }],
      gender: "female",
      birthDate: "1990-05-15",
    },
    mode: "create",
  },
}).execute();

// outcome is OperationOutcome; inspect .issue for severity/code/diagnostics
```

Any parameter whose value has a `resourceType` is carried as
`parameter.resource` inside the `Parameters` body; primitive parameters
become `valueString` / `valueInteger` etc. The default method is POST —
pass `method: "GET"` if and only if all your parameters are primitive.

## Final snippet

```ts
import {
  createFhirClient,
  resolveSchema,
  validateOne,
  ValidationError,
  ValidationUnavailableError,
} from "@fhir-dsl/core";
import { schemas } from "./fhir/r4/schemas/index.js";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
  schemas,
});

type PatientDraft = {
  resourceType: "Patient";
  name: Array<{ family?: string; given?: string[] }>;
  gender?: string;
  birthDate?: string;
};

export async function safeCreatePatient(draft: PatientDraft) {
  // 1. Client-side: structure + cardinality
  const schema = resolveSchema(schemas, "Patient");
  if (schema) {
    await validateOne(schema, draft); // throws ValidationError
  }

  // 2. Server-side: terminology
  const outcome = (await fhir.operation("$validate", {
    scope: { kind: "type", resourceType: "Patient" },
    parameters: { resource: draft, mode: "create" },
  }).execute()) as {
    resourceType: "OperationOutcome";
    issue: Array<{ severity: string; diagnostics?: string }>;
  };

  const hardErrors = outcome.issue.filter(
    (i) => i.severity === "error" || i.severity === "fatal",
  );
  if (hardErrors.length > 0) {
    throw new Error(
      `Server $validate rejected: ${hardErrors.map((i) => i.diagnostics).join("; ")}`,
    );
  }

  // 3. Create. .validate() on the response guards against a surprise
  // server mutation that breaks the schema you trusted seconds ago.
  return fhir.create(draft).execute();
}

export async function safeReadPatient(id: string) {
  try {
    return await fhir.read("Patient", id).validate().execute();
  } catch (e) {
    if (e instanceof ValidationUnavailableError) {
      // Misconfig — fall back to unvalidated read rather than crash hard
      return fhir.read("Patient", id).execute();
    }
    if (e instanceof ValidationError) {
      console.warn(`Server returned non-conformant Patient/${id}`, e.issues);
      throw e;
    }
    throw e;
  }
}
```

## Troubleshooting

- **`ValidationUnavailableError` thrown at `execute()`** → `schemas` not
  wired on `FhirClientConfig`. The registry lookup is lazy and fails
  only when a validation terminal actually runs.
- **`ValidationError` on every response** → your generator is a version
  behind the server. Regenerate against the same FHIR version the
  server advertises in its CapabilityStatement.
- **Server `$validate` succeeds but writes fail** → the server writes
  may enforce stricter business rules than `$validate` (e.g. uniqueness
  constraints). Treat `$validate` as a pre-flight smoke test, not a
  guarantee.
- **Zod schemas are big in the bundle** → switch to
  `--validator native`. The native emitter has no dependencies and
  tree-shakes to just the resources you import.
- **Profile validation not picked up** → pass the profile to `search()`
  (e.g. `search("Patient", "us-core-patient")`). Resource-level
  validation is the default; profile validation kicks in only when the
  profile name is supplied.
