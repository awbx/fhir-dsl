---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
description: Under five minutes from install to your first typed FHIR query.
---

# Quick Start

Under five minutes from install to a typed response. Uses the public HAPI test server at `https://hapi.fhir.org/baseR4`.

## 1. Install and generate

```bash
npm install @fhir-dsl/core @fhir-dsl/runtime
npm install -D @fhir-dsl/cli
npx @fhir-dsl/cli generate --version r4 --ig hl7.fhir.us.core@6.1.0 --out ./src/fhir
```

The last line writes `./src/fhir/r4/` with `client.ts`, `resources/*.ts`, `profiles/*.ts`, `search-params/*.ts`, and (if `--validator` was passed) `schemas/*.ts`.

## 2. Create a client

```ts
// src/fhir.ts
import { createClient } from "./fhir/r4";

export const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  // auth: { type: "bearer", credentials: process.env.FHIR_TOKEN! },
});
```

## 3. First typed search

```ts
import { fhir } from "./fhir";

const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .sort("birthdate", "desc")
  .count(5)
  .execute();

// Expected shape (typed, not just guessed):
//   result: {
//     data: Patient[];
//     total?: number;
//     included: never[];    // no .include() called
//     link?: BundleLink[];
//     raw: unknown;         // the raw Bundle response
//   }
for (const p of result.data) {
  console.log(p.id, p.name?.[0]?.family, p.birthDate);
}
```

Every argument is narrowed:

- `"Patient"` is constrained to resource types in the generated schema.
- `"family"` autocompletes from the Patient search params.
- `"eq"` is valid because `family` is a `string` param; `"gt"` would be a type error.
- `result.data[0].birthDate` is `FhirDate | undefined`, not `any`.

## 4. One advanced query

Cross-reference search with `.whereChained` plus `_include` to pull related resources in a single request:

```ts
import { fhir } from "./fhir";

// Observations whose subject is a Patient named "Smith",
// with the Patient and the performing Practitioner included in the bundle.
const obs = await fhir
  .search("Observation")
  .whereChained(["subject", "Patient"], "family", "eq", "Smith")
  .where("status", "eq", "final")
  .include("subject")
  .include("performer")
  .count(20)
  .execute();

// obs.data is Observation[]
// obs.included is typed as (Patient | Practitioner | PractitionerRole | Organization | ...)[]
//   — the exact union comes from the generated `includes` map.
for (const o of obs.data) {
  console.log(o.code.coding?.[0]?.display, o.valueQuantity?.value, o.valueQuantity?.unit);
}

for (const inc of obs.included ?? []) {
  if (inc.resourceType === "Patient") console.log("patient:", inc.id);
}
```

The compiled URL (visible via `.compile()` instead of `.execute()`) is:

```
GET Observation?subject:Patient.family=Smith&status=final&_include=Observation:subject&_include=Observation:performer&_count=20
```

## Next steps

- [Core Concepts](/docs/core-concepts/overview) — how the 6-generic `SearchQueryBuilder` threads schema, profile, selection, and include-union through every chained call.
- [DSL Syntax Reference](/docs/core-concepts/dsl-syntax) — every method: `whereIn`, `whereMissing`, `whereComposite`, `has`, `withProfile`, `select`, `summary`, `total`, `usePost`, `$if` / `$call`.
- [CLI Usage](/docs/cli/usage) — every generator flag, output layout, and IG conventions.
- [Validation Guide](/docs/guides/validation) — wiring zod or native Standard Schema validators into `.validate()`.
