---
id: complete-workflow
title: Complete Workflow
description: An end-to-end fhir-dsl walkthrough — bootstrap a project, generate types, compose typed queries, write back, and validate against a real server.
sidebar_label: Complete Workflow
---

# Complete Workflow

An end-to-end example that exercises every part of the DSL in one realistic scenario: build a clinical cohort, drill in with a composite parameter, write back atomically, then stream the matching population for bulk export.

Each section below is a self-contained step. Run them in order against the same `fhir` client.

## Setup

```typescript
import { createClient } from "./fhir/r4";

const fhir = createClient({
  baseUrl: "https://your-fhir-server.com/fhir",
  auth: { type: "bearer", credentials: process.env.FHIR_TOKEN! },
});
```

## 1. Build the Cohort

Find active US Core patients born before 1970 who have at least one systolic blood-pressure observation on record, whose assigned general practitioner is named "Smith". Pull the care team, conditions, and medication requests back in the same round-trip.

```typescript
const cohort = await fhir
  .search(
    "Patient",
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
  )
  .where("active", "eq", "true")
  .where("birthdate", "le", "1970-01-01")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|8480-6")
  .whereChained("general-practitioner", "Practitioner", "family", "eq", "Smith")
  .include("general-practitioner")
  .revinclude("Condition", "subject")
  .revinclude("MedicationRequest", "subject")
  .select(["id", "name", "birthDate", "address"])
  .sort("family", "asc")
  .count(50)
  .execute();
```

What each call contributes:

| Call | Role |
|---|---|
| `.search("Patient", <profile>)` | Narrows the result type to `USCorePatientProfile` — profile constraints become compile-time guarantees. |
| `.where("active", …)` / `.where("birthdate", …)` | Standard AND-filters with typed operators (`eq`, `le`, `ge`, etc.). |
| `.has(...)` | FHIR `_has`: "patient who is referenced as `subject` by an `Observation` with this code". Filters by existence of related resources. |
| `.whereChained(...)` | FHIR chained parameter: filters through a reference to a field on the referenced resource. |
| `.include("general-practitioner")` | Forward `_include` — pulls the referenced `Practitioner` (or `PractitionerRole`) resources. |
| `.revinclude("Condition", "subject")` | Reverse `_revinclude` — pulls every `Condition` whose `subject` points at one of these patients. |
| `.select([...])` | FHIR `_elements` projection — narrows payload *and* result type. |
| `.sort` / `.count` | Server-side ordering and page size. |

### Result shape

```typescript
const { data, included, link, raw } = cohort;
//      ^ Array of Patient narrowed to { id?; name?; birthDate?; address? }
//             ^ Array typed as Practitioner | Condition | MedicationRequest
//                       ^ BundleLink[]; pagination lives at link.find(l => l.relation === "next")?.url
//                             ^ The raw Bundle for anything the typed fields miss
```

The projection flows into the result type — fields you didn't select won't appear in autocomplete.

:::tip
`included` is tagged with `resourceType`, so you can discriminate:

```typescript
const conditions = cohort.included.filter(
  (r): r is Condition => r.resourceType === "Condition",
);
```
:::

## 2. Drill In with a Composite Parameter

The cohort tells us *which patients* have a BP reading. Composite parameters let us ask: "*which of their observations* have a systolic reading above 140?" — with both the code and the value matched on the same component element.

```typescript
const patientId = cohort.data[0].id!;

const elevated = await fhir
  .search("Observation")
  .where("patient", "eq", `Patient/${patientId}`)
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "gt140",
  })
  .sort("date", "desc")
  .execute();
```

Composite differs from multiple `.where()` calls: multiple `.where()`s are independent filters, whereas `whereComposite` requires both components to match the same element. Without it, you'd match observations that contain *any* component with code `8480-6` *and* *any* component with value `>140` — not necessarily the same one.

## 3. Atomic Write-Back

Tag the patient as needing follow-up, retire the old task, and open a new one — all in a single FHIR transaction. The server commits all three or none.

```typescript
await fhir
  .transaction()
  .update({
    resourceType: "Patient",
    id: patientId,
    active: true,
    meta: { tag: [{ code: "htn-follow-up" }] },
  })
  .delete("Task", "old-followup-task")
  .create({
    resourceType: "Task",
    status: "requested",
    intent: "order",
    for: { reference: `Patient/${patientId}` },
    description: "Schedule hypertension follow-up",
  })
  .execute();
```

Each entry is type-checked against its `resourceType`:

- `create()` / `update()` — the full resource body is typed per the schema; wrong shapes fail compilation.
- `delete("Task", "…")` — the first arg constrains the id to a valid resource type.

:::note
FHIR transactions are atomic; FHIR batches are not. Use `.transaction()` when you need all-or-nothing semantics, and a batch (when supported) when each entry should succeed or fail independently.
:::

## 4. Stream for Bulk Export

For population-level work — analytics, warehouse sync, ETL — eager `.execute()` doesn't scale. `.stream()` yields one resource at a time across every page, using constant memory.

```typescript
for await (const p of fhir
  .search("Patient")
  .where("active", "eq", "true")
  .count(200) // page size, not total cap
  .stream()) {
  await exportToWarehouse(p);
}
```

`.count()` under streaming controls the server-side page size (bigger pages → fewer round-trips, more memory per page). Combine with an `AbortController` to cancel cleanly:

```typescript
const controller = new AbortController();

for await (const p of fhir
  .search("Patient")
  .where("active", "eq", "true")
  .stream({ signal: controller.signal })) {
  if (shouldStop()) controller.abort();
  await exportToWarehouse(p);
}
```

See [Streaming & Lazy Loading](/docs/guides/streaming) for deeper coverage.

## Putting It Together

The four steps above compose the shape of most real-world FHIR workloads:

1. **Cohort discovery** — server-side filtering + graph fetching (`include` / `revinclude` / `_has` / chaining).
2. **Detail fetch** — targeted per-patient queries, often with composite params.
3. **Write-back** — atomic transactions tying reads to the resulting actions.
4. **Bulk processing** — streaming for anything that doesn't fit in one page.

Because every builder is immutable, any sub-query here can be extracted into a reusable function — see [Composing Reusable Queries](/docs/examples/queries#composing-reusable-queries) for the pattern.
