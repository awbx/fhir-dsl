---
id: queries
title: Query Patterns
description: Common fhir-dsl query patterns — chained, _has, _filter, paginated, included, and aggregate searches with copy-paste examples.
sidebar_label: Query Patterns
---

# Query Patterns

Common query patterns across different FHIR resource types.

## Observations

### Search by Patient and Status

```typescript
const result = await fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .sort("date", "desc")
  .count(20)
  .execute();

for (const obs of result.data) {
  console.log(obs.code?.text, obs.effectiveDateTime);
}
```

### Search by Code (LOINC)

```typescript
const result = await fhir
  .search("Observation")
  .where("code", "eq", "http://loinc.org|85354-9") // Blood pressure panel
  .where("patient", "eq", "Patient/123")
  .where("date", "ge", "2024-01-01")
  .execute();
```

### Vital Signs with US Core Profile

```typescript
const vitals = await fhir
  .search(
    "Observation",
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs"
  )
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .sort("date", "desc")
  .execute();

// vitals.data is typed as USCoreVitalSignsProfile[]
```

## Encounters

### Recent Encounters for a Patient

```typescript
const result = await fhir
  .search("Encounter")
  .where("patient", "eq", "Patient/123")
  .where("date", "ge", "2024-01-01")
  .sort("date", "desc")
  .count(10)
  .execute();
```

### Encounters by Status

```typescript
const result = await fhir
  .search("Encounter")
  .where("status", "eq", "finished")
  .where("class", "eq", "http://terminology.hl7.org/CodeSystem/v3-ActCode|AMB")
  .execute();
```

## Conditions

### Active Problems for a Patient

```typescript
const result = await fhir
  .search("Condition")
  .where("patient", "eq", "Patient/123")
  .where("clinical-status", "eq", "active")
  .execute();

for (const condition of result.data) {
  console.log(condition.code?.coding?.[0]?.display);
}
```

### Search by ICD-10 Code

```typescript
const result = await fhir
  .search("Condition")
  .where("code", "eq", "http://hl7.org/fhir/sid/icd-10-cm|E11.9")
  .execute();
```

## Medication Requests

### Active Medications for a Patient

```typescript
const result = await fhir
  .search("MedicationRequest")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "active")
  .sort("date", "desc")
  .execute();
```

## Multi-Resource Transactions

### Create a Patient with an Observation

```typescript
const bundle = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
    gender: "female",
    birthDate: "1990-01-15",
  })
  .create({
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8302-2",
          display: "Body height",
        },
      ],
    },
    valueQuantity: {
      value: 165,
      unit: "cm",
      system: "http://unitsofmeasure.org",
      code: "cm",
    },
  })
  .execute();
```

### Batch Update Multiple Resources

```typescript
const bundle = await fhir
  .transaction()
  .update({
    resourceType: "Patient",
    id: "patient-1",
    active: false,
  })
  .update({
    resourceType: "Patient",
    id: "patient-2",
    active: false,
  })
  .delete("Observation", "obs-old-1")
  .delete("Observation", "obs-old-2")
  .execute();
```

## Reverse Includes and Chained Searches

### Patient with All Their Observations (`_revinclude`)

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Johnson")
  .revinclude("Observation", "subject")
  .execute();

// result.data: Patient[]
// result.included: Observation[] referencing these patients
for (const obs of result.included) {
  console.log(obs.resourceType, obs.code?.text);
}
```

### Search Through References (Chained Parameters)

```typescript
// Find observations where the patient's name is "Smith"
const result = await fhir
  .search("Observation")
  .whereChained("subject", "Patient", "family", "eq", "Smith")
  .where("status", "eq", "final")
  .execute();
```

```typescript
// Find encounters where the practitioner is in a specific organization
const result = await fhir
  .search("Encounter")
  .whereChained("participant", "Practitioner", "name", "eq", "Dr. Jones")
  .sort("date", "desc")
  .execute();
```

### Filter by Referencing Resources (`_has`)

```typescript
// Find patients who have at least one blood pressure observation
const result = await fhir
  .search("Patient")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|85354-9")
  .where("active", "eq", "true")
  .execute();
```

```typescript
// Find patients with recent encounters
const result = await fhir
  .search("Patient")
  .has("Encounter", "subject", "date", "ge", "2024-01-01")
  .execute();
```

## Composite Search Parameters

Composite parameters let you search on multiple values simultaneously, ensuring they apply to the same logical record:

### Observation by Code and Quantity

```typescript
// Find observations with systolic blood pressure > 140
const result = await fhir
  .search("Observation")
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "gt140",
  })
  .execute();
```

### Combine Composite with Other Params

```typescript
const result = await fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "5.4|http://unitsofmeasure.org|mg",
  })
  .sort("date", "desc")
  .execute();
```

:::tip
Composite parameters are different from using multiple `.where()` calls. Multiple `.where()` calls act as independent filters (AND), while a composite parameter ensures the component values match on the same element within a resource.
:::

## Projecting Fields

Use `.select()` to request only specific top-level fields. The query compiles to FHIR's [`_elements`](https://www.hl7.org/fhir/search.html#elements) parameter and the result type narrows to match — useful for reducing payload size on mobile or for dashboards that only need a few fields.

```typescript
const summary = await fhir
  .search("Patient")
  .where("active", "eq", "true")
  .select(["id", "name", "birthDate"])
  .count(100)
  .execute();

// summary.data[0] is typed as { resourceType: "Patient"; id?: string; name?: HumanName[]; birthDate?: FhirDate }
```

Only top-level element names are accepted — `_elements` does not support nested paths. Calling `.select()` twice replaces the previous selection.

```typescript
// Combine with includes — projection applies only to the primary resource,
// included resources are returned in full.
const { data, included } = await fhir
  .search("Patient")
  .select(["id", "name"])
  .include("general-practitioner")
  .execute();
```

:::note
Per the FHIR spec, servers return *at least* the requested elements and may return more. The narrowed TypeScript type reflects what you asked for, not what the server is guaranteed to return.
:::

## Composing Reusable Queries

Because builders are immutable, you can create reusable base queries:

```typescript
// Base query for a patient's data
function patientData(patientId: string) {
  return fhir
    .search("Observation")
    .where("patient", "eq", `Patient/${patientId}`)
    .where("status", "eq", "final");
}

// Extend for specific use cases
const recentLabs = await patientData("123")
  .where("category", "eq", "http://terminology.hl7.org/CodeSystem/observation-category|laboratory")
  .where("date", "ge", "2024-01-01")
  .sort("date", "desc")
  .execute();

const allVitals = await patientData("123")
  .where("category", "eq", "http://terminology.hl7.org/CodeSystem/observation-category|vital-signs")
  .sort("date", "desc")
  .execute();
```

:::tip
This pattern works because `where()` returns a new builder. The `patientData()` function produces a fresh builder each time it's called, and subsequent `.where()` calls extend it without mutation.
:::

## Streaming Large Datasets

Use `.stream()` to iterate over results across all pages without loading everything into memory:

```typescript
// Stream all active patients, page by page
for await (const patient of fhir.search("Patient").where("active", "eq", "true").stream()) {
  console.log(patient.id, patient.name);
}
```

### Stream with Cancellation

```typescript
const controller = new AbortController();

// Stop after processing 1000 results
let count = 0;
for await (const obs of fhir.search("Observation").stream({ signal: controller.signal })) {
  process(obs);
  if (++count >= 1000) {
    controller.abort();
    break;
  }
}
```

### Stream with Filters

`.stream()` works with all query builder methods:

```typescript
for await (const obs of fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .sort("date", "desc")
  .count(100) // page size
  .stream()
) {
  console.log(obs.code?.text, obs.effectiveDateTime);
}
```

:::tip
See the [Streaming & Lazy Loading](/docs/guides/streaming) guide for more details on streaming vs eager execution.
:::

## Working with Pagination (Runtime)

For lower-level control, use the runtime package's pagination utilities directly:

```typescript
import { FhirExecutor, fetchAllPages, paginate } from "@fhir-dsl/runtime";

const executor = new FhirExecutor({
  baseUrl: "https://your-fhir-server.com/fhir",
});

// Fetch all pages at once
const query = fhir.search("Patient").where("active", "eq", "true").compile();
const firstPage = await executor.execute(query);
const allPatients = await fetchAllPages(executor, firstPage);

// Or stream pages with an async generator
for await (const page of paginate(executor, firstPage)) {
  console.log(`Processing ${page.length} patients`);
}
```

## Advanced Search Patterns

### OR across multiple values

```typescript
// Either gender, in one round-trip
const result = await fhir
  .search("Patient")
  .whereIn("gender", ["male", "female"])
  .execute();
// Patient?gender=male,female
```

### Filter by missing data

```typescript
// Patients with no recorded birthdate
const result = await fhir
  .search("Patient")
  .whereMissing("birthdate", true)
  .execute();
```

### Multi-hop chained search

```typescript
// Observations whose Encounter's Patient is named "Smith"
const result = await fhir
  .search("Observation")
  .whereChain(
    [["encounter", "Encounter"], ["subject", "Patient"]],
    "name",
    "eq",
    "Smith",
  )
  .execute();
```

### Transitive _include

```typescript
// Walk MedicationRequest -> Medication -> Substance
const result = await fhir
  .search("MedicationRequest")
  .include("medication")
  .include("medication", { iterate: true })
  .execute();
```

### POST _search for long URLs

```typescript
// Bulk identifier lookup that wouldn't fit in a GET URL
const result = await fhir
  .search("Patient")
  .whereIn("identifier", manyMrns)
  .usePost()
  .execute();
```

### Result-shaping with meta params

```typescript
// Just the count -- no resources, no narrative
const { total } = await fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .summary("count")
  .total("accurate")
  .execute();
```

### Server-side _filter expression

```typescript
const result = await fhir
  .search("Patient")
  .filter("name eq 'Smith' and (birthdate gt 1990 or active eq true)")
  .execute();
```

## Composable Conditions (`where(callback)`)

When OR spans **different** parameters or the conditions need to be nested, pass a callback to `where(...)`. The compiler picks the most natural FHIR shape automatically -- comma-OR for the simple case, `_filter` for everything else.

### Same-parameter OR (compiles to comma-join)

```typescript
const result = await fhir
  .search("Observation")
  .where((eb) =>
    eb.or([
      ["status", "eq", "final"],
      ["status", "eq", "amended"],
    ]),
  )
  .execute();
// → Observation?status=final,amended
```

### OR across different parameters (compiles to `_filter`)

```typescript
// Match either condition status — falls back to _filter
const result = await fhir
  .search("Observation")
  .where((eb) =>
    eb.or([
      ["status", "eq", "final"],
      ["code", "eq", "http://loinc.org|85354-9"],
    ]),
  )
  .execute();
// → Observation?_filter=status eq 'final' or code eq 'http://loinc.org|85354-9'
```

### Nested groups

```typescript
// "subject is Patient/123 AND (status is final OR amended)"
const result = await fhir
  .search("Observation")
  .where((eb) =>
    eb.and([
      ["subject", "eq", "Patient/123"],
      eb.or([
        ["status", "eq", "final"],
        ["status", "eq", "amended"],
      ]),
    ]),
  )
  .execute();
```

:::note
Operators with no `_filter` equivalent (`exact`, `above`, `below`, `of-type`, `text`, `identifier`, `code-text`, `missing`) cannot appear inside an OR or nested group — use the positional `where(...)` form for those. See [Functional `where`](/docs/core-concepts/dsl-syntax#functional-where-composable-conditions) for the full operator-mapping table.
:::

## Conditional Clauses (`$if` and `$call`)

Every fluent builder exposes two Kysely-style composition primitives that let you wire optional clauses and reusable fragments without breaking out of the chain.

### Conditionally append clauses with `$if`

```typescript
async function searchPatients(filters: {
  family?: string;
  active?: boolean;
  withObservations?: boolean;
}) {
  return fhir
    .search("Patient")
    .$if(filters.family != null, (qb) => qb.where("family", "eq", filters.family!))
    .$if(filters.active === true, (qb) => qb.where("active", "eq", "true"))
    .$if(filters.withObservations === true, (qb) => qb.revinclude("Observation", "subject"))
    .execute();
}
```

`$if` returns the same builder type via polymorphic `this`, so include narrowing, profile selection, and `_elements` projection all survive across chained `$if` calls.

### Extract reusable fragments with `$call`

```typescript
// Define once
const recentFinal = <T extends { where: any }>(qb: T) =>
  qb.where("status", "eq", "final").where("date", "ge", "2024-01-01");

// Reuse anywhere
const obs = await fhir.search("Observation").$call(recentFinal).count(50).execute();
const enc = await fhir.search("Encounter").$call(recentFinal).execute();
```

`$call` always invokes the callback and returns whatever it returns — useful for extracting query fragments, or for piping a builder into a non-builder result (e.g. `qb.$call((b) => b.compile())`).

### Combining both

```typescript
const tenantScope = (tenantId: string) =>
  <T extends { where: any }>(qb: T) =>
    qb.where("organization", "eq", `Organization/${tenantId}`);

const result = await fhir
  .search("Patient")
  .$call(tenantScope("acme"))
  .$if(searchTerm.length > 0, (qb) => qb.where("name", "contains", searchTerm))
  .execute();
```

## Error Handling

```typescript
import { FhirError } from "@fhir-dsl/runtime";

try {
  const patient = await fhir.read("Patient", "nonexistent").execute();
} catch (error) {
  if (error instanceof FhirError) {
    console.error(`Status: ${error.status} ${error.statusText}`);

    // FHIR OperationOutcome details
    for (const issue of error.issues) {
      console.error(`${issue.severity}: ${issue.diagnostics}`);
    }
  }
}
```
