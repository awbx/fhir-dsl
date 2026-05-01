---
id: resources
title: Resources and Schema
description: How fhir-dsl models FHIR resources, profiles, and search parameters as a generated TypeScript schema and feeds them to every typed builder.
sidebar_label: Resources
sidebar_position: 3
---

# Resources and Schema

FHIR resources are the fundamental units of health data. fhir-dsl generates TypeScript interfaces for every resource in the FHIR specification (plus any IGs you pass), then collects those interfaces into a single `FhirSchema` type that drives every query builder's type inference.

## The `FhirSchema` shape

The generated `FhirSchema` has exactly the shape declared in `packages/core/src/types.ts:12`:

```typescript
export interface FhirSchema {
  resources: any;     // { Patient: Patient; Observation: Observation; ... }
  searchParams: any;  // { Patient: { family: { type: "string"; value: string }; ... } }
  includes: any;      // { Patient: { "general-practitioner": "Practitioner" | ... } }
  revIncludes?: any;  // { Patient: { Observation: "subject" | ... } }
  profiles: any;      // { Patient: { "us-core-patient": USCorePatient } }
}
```

The builder threads `RT extends keyof S["resources"]` guards throughout (`types.ts:22, :28, :42, :46`), so indexed access (`S["searchParams"][RT]`) stays sound without requiring index signatures on the generated interfaces. This is the same pattern Kysely uses for `Database` — concrete shapes satisfy a loose constraint.

The five slots power the six-generic search builder; see [Types & Generics](./types-and-generics.md) for how each slot is threaded.

## Generated resource types

When you run the CLI, each FHIR resource gets its own TypeScript interface. For example:

```typescript
// Generated: src/fhir/r4/resources/patient.ts
export interface Patient extends DomainResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: FhirBoolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode<"male" | "female" | "other" | "unknown">;
  birthDate?: FhirDate;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference<"Practitioner" | "Organization" | "PractitionerRole">[];
  managingOrganization?: Reference<"Organization">;
  // ... every property from the FHIR spec
}
```

Key features of generated types:

- **Literal `resourceType`** — enables discriminated-union narrowing on `Bundle.entry.resource`.
- **Optional vs required** — cardinality from the spec is preserved.
- **Typed references** — `Reference<"Practitioner" | "Organization">` constrains what a reference can point to (and drives `.include()` target inference).
- **Backbone elements** — nested structures are generated as separate interfaces (e.g., `PatientContact`) rather than inlined.

:::note Gotcha — the resource interface is the *full* spec shape
Even with `--expand-valuesets`, you are handed the full-fidelity FHIR interface, not a narrowed subset. Use `.select([...])` at query time when you want the type to reflect only the fields you asked for.
:::

## FHIR primitives

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
| `code` | `FhirCode` / `FhirCode<T>` | `string` |
| `id` | `FhirId` | `string` |
| `instant` | `FhirInstant` | `string` |

These types are compatible with their underlying JavaScript types, so you can assign plain strings and numbers directly.

:::tip Generic `FhirCode<T>` from ValueSet bindings
With `--expand-valuesets`, `FhirCode` fields with required or extensible bindings become `FhirCode<T>` where `T` is a literal union (e.g., `FhirCode<"male" | "female" | "other" | "unknown">`). The generator plugs the expansion directly into the type.
:::

## Complex datatypes

Common FHIR datatypes are provided by `@fhir-dsl/types` (`packages/types/src/datatypes.ts`):

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
  Bundle,
  BundleEntry,
  Parameters,
} from "@fhir-dsl/types";
```

Three datatypes are generic on a constrainable `T`:

- **`Reference<T extends string = string>`** — the optional `type` field narrows to `T`. The generator emits narrowed references so `Observation.subject` is typed as `Reference<"Patient" | "Group" | "Device" | "Location">`. Plain `Reference` (no generic) accepts any string.
- **`Coding<T extends string = string>`** — `code` narrows to `T`. When the generator resolves a binding to a ValueSet it can plug the code union in.
- **`CodeableConcept<T extends string = string>`** — `coding?: Coding<T>[]`.

These generic datatypes are what let ValueSet bindings flow through to the edit point.

## Typed references

References encode their target resource types as a generic parameter:

```typescript
interface Observation extends DomainResource {
  // Can only reference Patient, Group, Device, or Location
  subject?: Reference<"Patient" | "Group" | "Device" | "Location">;

  // Can only reference Practitioner, PractitionerRole, or Organization
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization">[];
}
```

This prevents linking resources to invalid targets at compile time. The **same target list** drives `.include()` inference: when you call `.include("subject")` on an Observation search, the `Inc` generic picks up `"Patient" | "Group" | "Device" | "Location"`.

:::note Gotcha — `Reference<T>` narrows `type`, not `reference`
The generic narrows the `type?: T` discriminator. The `reference?: string` field (the URL or relative path) is still a free-form string. When you need the target resource, parse `Type/id` from `reference.split("/")` or call `fhir.read(type, id)`.
:::

## Backbone elements

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

Naming follows the pattern `<Resource><Path>`; `fhirPathToPropertyName` in `@fhir-dsl/utils` is the helper the generator uses.

## The resource registry

All generated resources live under `S["resources"]`:

```typescript
type FhirSchema = {
  resources: {
    Patient: Patient;
    Observation: Observation;
    Encounter: Encounter;
    Condition: Condition;
    // ... every generated resource
  };
  // ...
};
```

This is what makes `fhir.search("Patient")` resolve to the correct type — TypeScript looks up `"Patient"` in the map and infers the full `Patient` interface. Profile-aware queries swap this out for the narrowed profile shape via `ResolveProfile<S, RT, P>`.

## Profiles

Profiles (US Core, IPS, vendor-specific IGs) are narrowed resource shapes that tighten cardinality, bind codes to specific ValueSets, and add extensions. They live under `S["profiles"][RT][ProfileName]`:

```typescript
type FhirSchema = {
  // ...
  profiles: {
    Patient: {
      "us-core-patient": USCorePatient;   // gender required, identifier required, ...
      "us-core-practitioner": /* ... */;
    };
  };
};
```

Pass the profile name as the second argument to `search()`:

```typescript
const result = await fhir
  .search("Patient", "us-core-patient")
  .where("family", "eq", "Jones")
  .execute();

for (const p of result.data) {
  // `gender` is required under US Core — no optional chaining needed
  console.log(p.gender, p.identifier[0].value);
}
```

The builder swaps its `Prof` generic and subsequent `.select()` / `.validate()` calls use the profile's schema. See [Types & Generics](./types-and-generics.md#prof---withprofile-and-search-overload) for the type-threading details.

## Extensions

FHIR represents extensions as an `Extension[]` array on every `DomainResource` / `BackboneElement`:

```typescript
const patient: Patient = {
  resourceType: "Patient",
  extension: [
    { url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race", valueCodeableConcept: { /* ... */ } },
  ],
  // ...
};
```

FHIR JSON also stores **primitive extensions** as `_field` siblings: `Patient.name[0].family` is the string, and `Patient.name[0]._family` holds the extension array. The FHIRPath evaluator merges these into a single logical element with `.extension` navigation (see [FHIRPath overview](/docs/fhirpath/overview) and commit `6a71f72`).

## Creating resources

The generated types work naturally for creating resources:

```typescript
const patient: Patient = {
  resourceType: "Patient",
  name: [
    { use: "official", family: "Smith", given: ["John", "Michael"] },
  ],
  gender: "male",
  birthDate: "1990-05-15",
  address: [
    { use: "home", line: ["123 Main St"], city: "Springfield", state: "IL", postalCode: "62701" },
  ],
};

await fhir.create(patient).execute();
```

TypeScript validates every property, catches typos, and provides autocomplete for all fields. `update`, `patch`, and `transaction().create(...)` share the same typed input.

## Per-FHIR-version types

`SpecCatalog` (`packages/generator/src/spec/catalog.ts`) is the single source of truth for type resolution and is built fresh for each FHIR version (R4 / R4B / R5 / R6). Types differ between versions — `Patient.contact` in R4 is a backbone element, for example — so re-generate whenever your server moves versions. Point the CLI at the version you target:

```bash
fhir-gen generate --version r5 --out ./src/fhir
```
