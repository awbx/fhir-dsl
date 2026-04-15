---
id: resources
title: Resources
sidebar_label: Resources
---

# Resources

FHIR resources are the fundamental units of health data. fhir-dsl generates TypeScript interfaces for every resource in the FHIR specification, giving you full type safety when creating, reading, and querying resources.

## Generated Resource Types

When you run the CLI, each FHIR resource gets its own TypeScript interface:

```typescript
// Generated: src/fhir/r4/resources/patient.ts
export interface Patient extends DomainResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: FhirBoolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference<"Practitioner" | "Organization" | "PractitionerRole">[];
  managingOrganization?: Reference<"Organization">;
  // ... all properties from the FHIR spec
}
```

Key features of generated types:

- **Literal `resourceType`** -- Discriminated union support for narrowing
- **Optional vs required** -- Cardinality from the spec is preserved
- **Typed references** -- `Reference<"Practitioner" | "Organization">` constrains what a reference can point to
- **Backbone elements** -- Nested structures are generated as separate interfaces (e.g., `PatientContact`)

## FHIR Primitives

FHIR primitives map to branded TypeScript types, not raw `string` or `number`:

| FHIR Type | TypeScript Type | Underlying |
|---|---|---|
| `string` | `FhirString` | `string` |
| `boolean` | `FhirBoolean` | `boolean` |
| `date` | `FhirDate` | `string` |
| `dateTime` | `FhirDateTime` | `string` |
| `integer` | `FhirInteger` | `number` |
| `decimal` | `FhirDecimal` | `number` |
| `uri` | `FhirUri` | `string` |
| `code` | `FhirCode` | `string` |
| `id` | `FhirId` | `string` |
| `instant` | `FhirInstant` | `string` |

These types are compatible with their underlying JavaScript types, so you can assign plain strings and numbers directly.

## Complex Data Types

Common FHIR data types are provided by `@fhir-dsl/types`:

```typescript
import type {
  HumanName,
  Address,
  ContactPoint,
  CodeableConcept,
  Coding,
  Identifier,
  Reference,
  Quantity,
  Period,
  Narrative,
  Meta,
} from "@fhir-dsl/types";
```

## Backbone Elements

Nested structures within resources are generated as separate interfaces:

```typescript
// Patient.contact becomes:
export interface PatientContact extends BackboneElement {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: FhirCode;
  organization?: Reference<"Organization">;
  period?: Period;
}
```

## Typed References

References encode their target types as a generic parameter:

```typescript
interface Observation extends DomainResource {
  // Can only reference Patient, Group, Device, or Location
  subject?: Reference<"Patient" | "Group" | "Device" | "Location">;

  // Can only reference Practitioner, PractitionerRole, or Organization
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization">[];
}
```

This prevents linking resources to invalid targets at compile time.

## The Resource Registry

All generated resources are collected into a single `FhirResourceMap`:

```typescript
export interface FhirResourceMap {
  Patient: Patient;
  Observation: Observation;
  Encounter: Encounter;
  Condition: Condition;
  // ... every generated resource
}
```

This registry is what makes `fhir.search("Patient")` resolve to the correct type -- TypeScript looks up `"Patient"` in the map and infers the full `Patient` interface.

## Creating Resources

The generated types work naturally for creating resources:

```typescript
const patient: Patient = {
  resourceType: "Patient",
  name: [
    {
      use: "official",
      family: "Smith",
      given: ["John", "Michael"],
    },
  ],
  gender: "male",
  birthDate: "1990-05-15",
  address: [
    {
      use: "home",
      line: ["123 Main St"],
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
    },
  ],
};
```

TypeScript validates every property, catches typos, and provides autocomplete for all fields.
