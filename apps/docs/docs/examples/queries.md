---
id: queries
title: Query Patterns
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

## Working with Pagination

Using the runtime package for paginated results:

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
