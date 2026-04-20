---
sidebar_position: 10
title: "Flat Rows for Export"
description: "Project FHIR resources + included references into a single flat table of rows suitable for CSV, analytics, or a dashboard."
---

# Flat Rows for Export

## Problem

A reporting dashboard needs Encounters rendered as one row each, with the
Patient's name, the attending Practitioner, and the service-provider
Organization denormalized into the same row. Walking the Bundle by hand
means string-splitting `"Patient/123"`, building a lookup map, and typing
every shape — four resources, one denormalization, dozens of lines of
glue per field.

`.transform()` collapses the whole pipeline into one builder chain.

## Prerequisites

- Generated client at `./fhir/r4` (run `fhir-gen generate --version r4 --out ./src/fhir`)
- Packages: `@fhir-dsl/core`
- Server: any FHIR R4 server that honors `_include` (HAPI works)

## Steps

### 1. Create the client

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
});
```

### 2. Shape the row

Decide what each row looks like up front. The type is inferred — you're
not declaring it, you're just building the shape inside the callback.

```ts
const rows = await fhir
  .search("Encounter")
  .where("status", "eq", "finished")
  .include("patient")
  .include("practitioner")
  .include("service-provider")
  .transform((t) => ({
    encounterId: t("id", null),
    status: t("status", "unknown"),

    // Patient (activated by .include("patient"))
    patientId: t.ref("subject.reference"),
    patientGiven: t("subject.name.0.given.0", null),
    patientFamily: t("subject.name.0.family", null),
    patientGender: t.enum(
      "subject.gender",
      { male: "M", female: "F", other: "O" },
      "U",
    ),

    // Practitioner (activated by .include("practitioner"))
    practitionerId: t.ref("participant.0.actor.reference"),
    practitionerFamily: t("participant.0.actor.name.0.family", null),

    // Organization (activated by .include("service-provider"))
    organizationName: t("serviceProvider.name", null),

    // Structured codes
    classCode: t.coding("class.coding", "http://terminology.hl7.org/CodeSystem/v3-ActCode"),
  }))
  .execute();

console.log(rows.data[0]);
// {
//   encounterId: "abc-123",
//   status: "finished",
//   patientId: "pat-1",
//   patientGiven: "Ada",
//   patientFamily: "Lovelace",
//   patientGender: "F",
//   practitionerId: "pr-1",
//   practitionerFamily: "Turing",
//   organizationName: "St. Vincent's",
//   classCode: "AMB",
// }
```

### 3. Stream for larger result sets

For thousands of Encounters, pull rows one at a time so memory doesn't
balloon. `stream()` yields each transformed row as its underlying page
lands.

```ts
import { createWriteStream } from "node:fs";
import { stringify } from "node:querystring";

const out = createWriteStream("encounters.csv");
out.write("encounter_id,patient_family,practitioner_family,org_name\n");

for await (const row of fhir
  .search("Encounter")
  .where("status", "eq", "finished")
  .include("patient")
  .include("practitioner")
  .include("service-provider")
  .transform((t) => ({
    id: t("id", ""),
    patient: t("subject.name.0.family", ""),
    practitioner: t("participant.0.actor.name.0.family", ""),
    org: t("serviceProvider.name", ""),
  }))
  .stream()) {
  out.write(`${row.id},${row.patient},${row.practitioner},${row.org}\n`);
}
```

### 4. Handle missing data gracefully

`.transform()` returns your fallback whenever a path doesn't resolve —
the server dropped the include, the reference points to a resource
outside the bundle, or a field simply isn't populated. Choose fallbacks
that match the downstream consumer:

```ts
.transform((t) => ({
  patientId:   t.ref("subject.reference"),          // null for missing Reference
  patientName: t("subject.name.0.family", "(unknown)"),  // string placeholder
  loincCode:   t.coding("code.coding", "http://loinc.org"),  // null for missing Coding
}))
```

No try/catch, no optional chains — the walker never throws on missing
data.

## Why not `.execute()` + manual walk?

The old pattern looked like this:

```ts
// Before
const result = await fhir
  .search("Encounter")
  .include("patient")
  .execute();

const byRef = new Map<string, Patient>();
for (const r of result.included ?? []) {
  if (r.resourceType === "Patient" && r.id) byRef.set(`Patient/${r.id}`, r);
}

const rows = result.data.map((enc) => {
  const patient = enc.subject?.reference ? byRef.get(enc.subject.reference) : undefined;
  return {
    id: enc.id,
    patient: patient?.name?.[0]?.family ?? null,
  };
});
```

With `.transform()`:

```ts
// After
const rows = await fhir
  .search("Encounter")
  .include("patient")
  .transform((t) => ({
    id: t("id", null),
    patient: t("subject.name.0.family", null),
  }))
  .execute();
```

Every step the manual version does — bundle split, prefixed lookup map,
reference resolution, optional chaining — moves inside `.transform()`. The
builder knows the expressions (`Encounter.subject` for `patient`) because
the generator emits them alongside the schema types, so there's no magic
or runtime introspection.

## Related

- [`.transform()` guide](../guides/transform.md) — full API reference
- [Patient Timeline](./patient-timeline.md) — building a chronological
  timeline across Encounter / Observation joins
- [Parallel Reference Fetch](./parallel-fetch-references.md) — when
  `_include` isn't an option and you need to roll your own hydration
