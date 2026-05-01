---
id: terminology
title: Terminology Engine
description: Resolve, expand, and validate ValueSets and CodeSystems offline — with required/extensible binding enforcement and FHIRPath conformsTo() hooks.
sidebar_label: Terminology
---

# Terminology Engine

FHIR resources use coded values everywhere -- `Patient.gender`, `Observation.status`, `Condition.clinicalStatus`. Each coded element has a **binding** to a ValueSet that defines which codes are valid. By default, the generator emits plain `FhirCode` (= `string`) for all code fields. The Terminology Engine resolves these bindings into TypeScript literal unions, giving you compile-time validation and IntelliSense for coded values.

## Enabling Terminology

Pass `--expand-valuesets` when generating types:

```bash
fhir-gen generate \
  --version r4 \
  --expand-valuesets \
  --out ./src/fhir
```

This downloads the FHIR spec's pre-expanded ValueSets (`expansions.json`, ~12MB, cached) and resolves bindings offline.

To also generate CodeSystem namespace objects for IntelliSense helpers:

```bash
fhir-gen generate \
  --version r4 \
  --expand-valuesets \
  --resolve-codesystems \
  --out ./src/fhir
```

## What Changes

### Before (without `--expand-valuesets`)

```typescript
export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;           // any string
  maritalStatus?: CodeableConcept; // any codes
  // ...
}
```

### After (with `--expand-valuesets`)

```typescript
export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode<AdministrativeGender>;  // "male" | "female" | "other" | "unknown"
  maritalStatus?: CodeableConcept;          // example binding -- not constrained
  // ...
}
```

Invalid codes are caught at compile time:

```typescript
const patient: Patient = {
  resourceType: "Patient",
  gender: "male",     // OK
  gender: "banana",   // Type error: '"banana"' is not assignable to type 'AdministrativeGender'
};
```

## Binding Strengths

FHIR defines four binding strengths. The generator handles each differently:

| Strength | Behavior | Example Output |
|---|---|---|
| `required` | Closed literal union -- only listed codes are valid | `FhirCode<AdministrativeGender>` |
| `extensible` | Open union with autocomplete -- known codes + any string | `CodeableConcept<ConditionClinical \| (string & {})>` |
| `preferred` | No constraint -- too loose for compile-time checks | `FhirCode` (unchanged) |
| `example` | No constraint -- illustrative only | `CodeableConcept` (unchanged) |

### Required Bindings

Required bindings produce a closed set. Only the listed codes compile:

```typescript
// Generated type
type AdministrativeGender = "male" | "female" | "other" | "unknown";

// Usage
const patient: Patient = {
  resourceType: "Patient",
  gender: "female",  // autocomplete shows all 4 options
};
```

### Extensible Bindings

Extensible bindings use the `(string & {})` idiom to preserve autocomplete while allowing unlisted codes:

```typescript
// Generated type
type ConditionClinical = "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved";

// In the resource interface
clinicalStatus?: CodeableConcept<ConditionClinical | (string & {})>;

// Usage -- autocomplete suggests known codes, but custom strings also compile
const condition: Condition = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{ code: "active" }],     // autocomplete works
  },
};
```

## Generated Files

When `--expand-valuesets` is enabled, the generator creates a `terminology/` directory:

```
src/fhir/r4/
  terminology/
    valuesets.ts      # Literal union types for all resolved ValueSets
    codesystems.ts    # CodeSystem namespace objects (with --resolve-codesystems)
    index.ts          # Re-exports
  resources/
    patient.ts        # Now uses FhirCode<AdministrativeGender>
    observation.ts    # Now uses FhirCode<ObservationStatus>
    ...
```

### ValueSet Types (`valuesets.ts`)

Each resolved ValueSet becomes a literal union type:

```typescript
export type AdministrativeGender = "male" | "female" | "other" | "unknown";
export type ObservationStatus = "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown";
export type EncounterStatus = "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled" | "entered-in-error" | "unknown";
// ... hundreds more
```

### CodeSystem Objects (`codesystems.ts`)

When `--resolve-codesystems` is used, const objects are generated for IntelliSense:

```typescript
export const AdministrativeGender = {
  Male: "male" as const,
  Female: "female" as const,
  Other: "other" as const,
  Unknown: "unknown" as const,
} as const;

export const ObservationStatus = {
  Registered: "registered" as const,
  Preliminary: "preliminary" as const,
  Final: "final" as const,
  // ...
} as const;
```

Use these for readable, discoverable code:

```typescript
import { AdministrativeGender } from "./fhir/r4/terminology/codesystems.js";

const patient: Patient = {
  resourceType: "Patient",
  gender: AdministrativeGender.Female,  // "female"
};
```

## Generic Data Types

The `Coding` and `CodeableConcept` types are generic with a default `string` parameter:

```typescript
// From @fhir-dsl/types
interface Coding<T extends string = string> extends Element {
  system?: FhirUri;
  code?: FhirCode<T>;
  display?: FhirString;
  // ...
}

interface CodeableConcept<T extends string = string> extends Element {
  coding?: Coding<T>[];
  text?: FhirString;
}
```

The default `= string` means all existing code works without changes. The generic parameter only narrows the type when a binding is resolved.

## Resolution Strategy

The Terminology Engine resolves ValueSets offline using this strategy:

1. **Pre-expanded ValueSets** -- `expansions.json` from the FHIR spec contains ~900 pre-expanded ValueSets with flat code lists. This is the fast path.
2. **Compose resolution** -- For ValueSets with `compose.include[].concept[]` (explicit code lists), codes are collected directly.
3. **CodeSystem lookup** -- For `compose.include[]` referencing a complete CodeSystem, all codes are pulled from the local CodeSystem.
4. **Unresolvable** -- ValueSets requiring a terminology server (SNOMED subsets, LOINC filters) are skipped. The binding falls back to an unparameterized type.

This means most FHIR-defined ValueSets resolve successfully, while external terminology (SNOMED CT, LOINC, RxNorm) gracefully degrades to plain `string`.

## Backward Compatibility

The terminology engine is fully opt-in:

- Without `--expand-valuesets`, generated output is identical to before
- `Coding<T = string>` and `CodeableConcept<T = string>` defaults mean existing code compiles unchanged
- Unresolved bindings produce the same unparameterized types as before
- No runtime dependencies -- all type information is erased at compile time

## Examples

### Patient with Typed Gender

```typescript
import type { Patient } from "./fhir/r4";
import { AdministrativeGender } from "./fhir/r4";

// Autocomplete shows: "male" | "female" | "other" | "unknown"
const patient: Patient = {
  resourceType: "Patient",
  gender: "female",
  name: [{ family: "Smith", given: ["Jane"] }],
};

// Type error at compile time
const bad: Patient = {
  resourceType: "Patient",
  gender: "banana", // Error: Type '"banana"' is not assignable
};
```

### Observation with Required Status

```typescript
import type { Observation } from "./fhir/r4";

const obs: Observation = {
  resourceType: "Observation",
  status: "final",  // autocomplete: "registered" | "preliminary" | "final" | ...
  code: {
    coding: [{ system: "http://loinc.org", code: "8867-4" }],
  },
};
```

### Condition with Extensible Clinical Status

```typescript
import type { Condition } from "./fhir/r4";

const condition: Condition = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{
      system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
      code: "active",  // autocomplete works, but custom strings also compile
    }],
  },
  subject: { reference: "Patient/123" },
};
```
