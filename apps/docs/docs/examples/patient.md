---
id: patient
title: Working with Patients
sidebar_label: Patient Examples
---

# Working with Patients

Real-world examples of creating, reading, searching, and updating Patient resources with fhir-dsl.

## Setup

All examples assume a typed client:

```typescript
import { createClient } from "./fhir/r4";

const fhir = createClient({
  baseUrl: "https://your-fhir-server.com/fhir",
  auth: { type: "bearer", credentials: process.env.FHIR_TOKEN! },
});
```

## Create a Patient

```typescript
const bundle = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    identifier: [
      {
        system: "http://hospital.example.org/mrn",
        value: "MRN-12345",
      },
    ],
    name: [
      {
        use: "official",
        family: "Johnson",
        given: ["Sarah", "Marie"],
      },
    ],
    gender: "female",
    birthDate: "1985-03-15",
    telecom: [
      {
        system: "phone",
        value: "+1-555-0123",
        use: "mobile",
      },
      {
        system: "email",
        value: "sarah.johnson@example.com",
      },
    ],
    address: [
      {
        use: "home",
        line: ["456 Oak Avenue", "Apt 2B"],
        city: "Portland",
        state: "OR",
        postalCode: "97201",
        country: "US",
      },
    ],
    maritalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
          code: "M",
          display: "Married",
        },
      ],
    },
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "N",
                display: "Next-of-Kin",
              },
            ],
          },
        ],
        name: {
          family: "Johnson",
          given: ["Michael"],
        },
        telecom: [
          {
            system: "phone",
            value: "+1-555-0456",
          },
        ],
      },
    ],
  })
  .execute();
```

Every field in this object is type-checked. Misspelling `"resourceType"`, using an invalid `gender` code, or passing the wrong shape for `telecom` will be caught at compile time.

## Read a Patient by ID

```typescript
const patient = await fhir.read("Patient", "abc-123").execute();

console.log(patient.name?.[0]?.family);   // string | undefined
console.log(patient.birthDate);            // string | undefined
console.log(patient.gender);               // string | undefined
```

## Search for Patients

### By Name

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Johnson")
  .where("given", "eq", "Sarah")
  .execute();
```

### By Date of Birth

```typescript
const result = await fhir
  .search("Patient")
  .where("birthdate", "ge", "1980-01-01")
  .where("birthdate", "lt", "1990-01-01")
  .execute();
```

### By Identifier

```typescript
const result = await fhir
  .search("Patient")
  .where("identifier", "eq", "http://hospital.example.org/mrn|MRN-12345")
  .execute();
```

### Active Patients with Pagination

```typescript
const result = await fhir
  .search("Patient")
  .where("active", "eq", "true")
  .sort("family", "asc")
  .count(25)
  .offset(0)
  .execute();

console.log(`Found ${result.total} patients`);
console.log(`Showing ${result.data.length} results`);
```

## Include Related Resources

### Patient with General Practitioner

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Johnson")
  .include("general-practitioner")
  .execute();

for (const patient of result.data) {
  console.log(patient.name?.[0]?.family);
}

// Included practitioners are typed
for (const included of result.included) {
  console.log(included.resourceType);
}
```

### Patient with Managing Organization

```typescript
const result = await fhir
  .search("Patient")
  .where("active", "eq", "true")
  .include("organization")
  .execute();
```

### Patient with Their Observations (Reverse Include)

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Johnson")
  .revinclude("Observation", "subject")
  .execute();

for (const patient of result.data) {
  console.log(patient.name?.[0]?.family);
}

// Observations that reference these patients
for (const obs of result.included) {
  console.log(obs.resourceType, obs.code?.text);
}
```

### Patients with Recent Observations (`_has`)

```typescript
// Only patients who have a final observation after 2024-01-01
const result = await fhir
  .search("Patient")
  .has("Observation", "subject", "date", "ge", "2024-01-01")
  .where("active", "eq", "true")
  .execute();
```

## Update a Patient

```typescript
const bundle = await fhir
  .transaction()
  .update({
    resourceType: "Patient",
    id: "abc-123",
    name: [
      {
        use: "official",
        family: "Johnson-Smith",
        given: ["Sarah", "Marie"],
      },
    ],
    gender: "female",
    birthDate: "1985-03-15",
    address: [
      {
        use: "home",
        line: ["789 New Street"],
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
      },
    ],
  })
  .execute();
```

## Delete a Patient

```typescript
const bundle = await fhir
  .transaction()
  .delete("Patient", "abc-123")
  .execute();
```

## Compile a Query for Debugging

```typescript
const query = fhir
  .search("Patient")
  .where("family", "eq", "Johnson")
  .where("birthdate", "ge", "1980-01-01")
  .include("general-practitioner")
  .sort("family", "asc")
  .count(10)
  .compile();

console.log(JSON.stringify(query, null, 2));
// {
//   method: "GET",
//   path: "Patient",
//   params: [
//     { name: "family", value: "Johnson" },
//     { name: "birthdate", value: "ge1980-01-01" },
//     { name: "_include", value: "Patient:general-practitioner" },
//     { name: "_sort", value: "family" },
//     { name: "_count", value: 10 }
//   ]
// }
```

:::tip
Use `compile()` during development to verify your queries produce the expected FHIR REST URLs before hitting a server.
:::
