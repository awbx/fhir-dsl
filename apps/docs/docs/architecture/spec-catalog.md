---
id: spec-catalog
title: SpecCatalog
sidebar_label: SpecCatalog (v0.19)
---

# SpecCatalog — version-driven generation

As of `v0.19.0`, everything the generator emits is derived from the FHIR spec
of the version you pass on the CLI. The `--version` flag alone fully determines
the output: primitive types, primitive validation rules, complex datatypes,
base-property sets inherited from `Resource`/`DomainResource`/`Element`/
`BackboneElement`, the FHIRPath system-type map, and the common search params
shared by every resource.

Before v0.19 these tables lived as hardcoded constants in `@fhir-dsl/utils`
and inside the parsers. They were R4-flavored and partly wrong for R5/R6
(missing `integer64`, missing `MoneyQuantity`, incorrect common-search-param
list). That whole surface has been replaced with a per-version `SpecCatalog`
object built once at the start of `generate()` and threaded through parsers
and emitters.

## High-level pipeline

```
 ┌────────────────────────────────────────────────────────────────────┐
 │ CLI / generate() invocation:  fhir-gen --version r5 --out ./fhir   │
 └────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ downloader.ts                                                      │
 │   downloadSpec(version) / loadLocalSpec(dir)                       │
 │                                                                    │
 │     profiles-resources.json   → resource StructureDefinitions      │
 │     profiles-types.json       → primitive + complex-type SDs       │
 │                                  + abstract bases (Resource,       │
 │                                  DomainResource, Element, ...)     │
 │     search-parameters.json    → SearchParameter resources          │
 │     valuesets.json / ...      → terminology (optional)             │
 └────────────────────────────────────────────────────────────────────┘
                                   │  DownloadedSpec
                                   ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ spec/build-catalog.ts                                              │
 │   buildSpecCatalog(spec, version): SpecCatalog                     │
 │                                                                    │
 │   - Partitions StructureDefinitions by `kind`:                     │
 │       "primitive-type" → primitives (+ rules)                      │
 │       "complex-type"   → complexTypes                              │
 │       "resource" abstract → baseProperties walk                    │
 │   - Extracts primitive rules from each SD's `.value` element:      │
 │       regex  ← type[0].extension[regex].valueString (anchored)     │
 │       maxLength ← element.maxLength                                │
 │       min/max    ← minValueInteger / maxValueInteger               │
 │   - Walks Resource/DomainResource/Element/BackboneElement          │
 │     snapshots; one-dot-depth paths become inherited fields.        │
 │   - Reads each primitive's type[0].code to build the FHIRPath      │
 │     system-type URL map (http://hl7.org/fhirpath/System.String     │
 │     ↔ "string", etc.).                                             │
 │   - Filters SearchParameters whose `base` is ["Resource"] or       │
 │     ["DomainResource"] into the commonSearchParams list.           │
 └────────────────────────────────────────────────────────────────────┘
                                   │  SpecCatalog
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
 ┌───────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
 │ spec/type-mapping │  │   parsers/*         │  │   emitters/*     │
 │ makeTypeMapper    │  │ read baseProperties │  │ use catalog for  │
 │                   │  │ + fhirpathSystem    │  │ primitives.ts,   │
 │ TypeMapper {      │  │ Types directly      │  │ datatypes.ts,    │
 │   isPrimitive     │  │                     │  │ search-params,   │
 │   isComplexType   │  │                     │  │ + zod/native     │
 │   fhirTypeToTs    │  │                     │  │ schema adapters  │
 │ }                 │  │                     │  │                  │
 └───────────────────┘  └─────────────────────┘  └──────────────────┘
                                   │
                                   ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ Emitted output under outDir/                                       │
 │   primitives.ts       ← catalog.primitives                         │
 │   datatypes.ts        ← catalog.complexTypes (re-exports from      │
 │                         @fhir-dsl/types, stubs for the rest)      │
 │   search-params.ts    ← CommonSearchParams (Resource scope) +      │
 │                         DomainResourceSearchParams (extends        │
 │                         CommonSearchParams) + per-resource params  │
 │   resources/*.ts      ← resource interfaces, each extending        │
 │                         Resource or DomainResource                 │
 │   schema.ts           ← Standard Schema validators built from      │
 │                         catalog primitive rules                    │
 └────────────────────────────────────────────────────────────────────┘
```

## Data shape

`SpecCatalog` is the single object every downstream stage consumes.

```typescript
interface SpecCatalog {
  version: string;                                    // e.g. "r4", "r5"
  primitives: Map<string, PrimitiveEntry>;            // "string" → FhirString + rule
  complexTypes: Map<string, ComplexTypeEntry>;        // "HumanName" → { isAbstract }
  baseProperties: Map<BaseTypeName, Set<string>>;     // "Resource" → {id, meta, …}
  commonSearchParams: CommonSearchParamEntry[];       // _id, _lastUpdated, _text, …
  fhirpathSystemTypes: Map<string, string>;           // System.String → "string"
}

interface PrimitiveEntry {
  name: string;                                       // "string"
  tsType: string;                                     // "FhirString"
  rule: PrimitiveRule;                                // kind + regex/min/max/maxLength
  fhirpathSystemUrl?: string;
}

interface PrimitiveRule {
  kind: "string" | "number" | "integer" | "boolean";
  regex?: RegExp;                                     // anchored: ^(?:…)$
  min?: number;                                       // from minValueInteger
  max?: number;                                       // from maxValueInteger
  maxLength?: number;                                 // from element.maxLength
}

interface CommonSearchParamEntry {
  code: string;                                       // "_id", "_lastUpdated"
  type: string;                                       // "token", "date", …
  scope: "Resource" | "DomainResource";
}
```

`TypeMapper` is the narrow interface parsers and emitters receive — they never
touch the whole catalog when they only need primitive/complex lookups:

```typescript
interface TypeMapper {
  isPrimitive(code: string): boolean;
  isComplexType(code: string): boolean;
  fhirTypeToTs(code: string): string;                 // "boolean" → "FhirBoolean"
}

const mapper = makeTypeMapper(catalog);
```

## What lives where

| Concern                              | Before v0.19                              | After v0.19                                   |
| ------------------------------------ | ----------------------------------------- | --------------------------------------------- |
| Primitive list + TS name map         | `@fhir-dsl/utils` `FHIR_PRIMITIVE_TO_TS`  | `catalog.primitives`                          |
| Complex-type list                    | `@fhir-dsl/utils` `FHIR_COMPLEX_TO_TS`    | `catalog.complexTypes`                        |
| `isPrimitive` / `isComplexType`      | `@fhir-dsl/utils` helpers                 | `TypeMapper` from catalog                     |
| Primitive regex / min / max          | `emitter/schema/primitive-rules.ts` const | `buildPrimitiveRules(catalog)` factory        |
| Base fields on `Resource` etc.       | Hardcoded in `parser/structure-def…`      | `catalog.baseProperties`                      |
| FHIRPath system-URL → primitive map  | Duplicated in two parsers                 | `catalog.fhirpathSystemTypes`                 |
| Common search params                 | Static list in `search-param-emitter`     | `catalog.commonSearchParams`                  |
| `primitives.ts` / `datatypes.ts`     | `PRIMITIVES_TEMPLATE` / `DATATYPES_STUB`  | `emitPrimitives` / `emitDatatypes(catalog)`   |

## What stays hardcoded (by design)

A few things genuinely are conventions we own, not spec data:

- **Spec download URLs** (`downloader.ts`) — bootstrap. The spec can't tell you
  where it lives.
- **Primitive → branded TS name** (`FhirString`, `FhirBoolean`, …) — our naming
  convention. Derived algorithmically via `primitiveToTsName` as
  `"Fhir" + capitalize(name)`, with a small override for `integer64` / `xhtml`.
- **`FHIR_SEARCH_PARAM_TYPE_TO_TS`** — FHIR defines nine search-param types,
  but the TS interface names (`StringParam`, `TokenParam`, …) are ours.
  Stays in `@fhir-dsl/utils`.

## Scope-aware common search params

Prior to v0.19 every resource re-exported the same small hardcoded
`CommonSearchParams` list. R5/R6 actually split common params into two scopes,
and the new emitter honours that:

```
┌──────────────────────────┐
│   CommonSearchParams     │     // base = ["Resource"] — applies to every resource
│   _id, _lastUpdated,     │
│   _tag, _security, …     │
└───────────┬──────────────┘
            │ extends
            ▼
┌──────────────────────────┐
│ DomainResourceSearch…    │     // base = ["DomainResource"] — e.g. _text
│ _text, _content, …       │
└───────────┬──────────────┘
            │ extends
   ┌────────┴────────┐
   ▼                 ▼
PatientSearch…   OrganizationSearch…    // every resource extends the right parent
                                         // based on its catalog baseType
```

Resource emitters consult `catalog.baseProperties` to decide whether a
resource is-a `DomainResource` or only a `Resource`, and pick the matching
parent interface.

## Why it matters

- **Correctness across versions.** R5/R6 generated output now matches the
  spec — `integer64`, the full 14-entry Resource-scoped search params, and
  `DomainResourceSearchParams` all appear where they should.
- **No code edit to add a version.** Pointing the downloader at a new version
  and rebuilding the catalog is enough. Previously each new version required
  hand-curating the tables in `@fhir-dsl/utils`.
- **Single source of truth.** FHIRPath system types were duplicated in two
  parsers; base-property sets were duplicated between parser and emitter.
  Both live in the catalog now.
- **Better primitive validation.** Primitive rules come from each SD's own
  `.value` element, so regex / `maxLength` / numeric bounds stay in sync with
  the spec rather than slowly drifting.

## Breaking change

`@fhir-dsl/utils` no longer exports `isPrimitive`, `isComplexType`,
`fhirTypeToTs`, `fhirPrimitiveToTs`, `fhirComplexToTs`, or the underlying
maps. Downstream tooling that used them should build a `TypeMapper` from a
`SpecCatalog` (or use the generator's exports directly). `searchParamTypeToTs`
and the `FHIR_SEARCH_PARAM_TYPE_TO_TS` map are unchanged.
