---
sidebar_position: 5
title: "@fhir-dsl/generator"
description: "StructureDefinition parser, TypeScript emitter, and SpecCatalog — powers `fhir-gen generate` end-to-end."
---

# @fhir-dsl/generator

## Overview
`@fhir-dsl/generator` is the engine behind `fhir-gen generate`. It downloads FHIR specs (or reads them locally), builds a `SpecCatalog` as the single source of truth for type resolution, parses `StructureDefinition` and `SearchParameter` resources into typed models, and emits TypeScript resources, profiles, search params, and Standard Schema validators (zod or native).

## Installation
```bash
npm install -D @fhir-dsl/generator
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `generate` | function | Top-level driver: downloads or loads a spec, then emits TypeScript and validators. |
| `GeneratorOptions` | interface | Every generator knob (version, out dir, IGs, validator, strictness). |
| `ValidatorTarget` | type | `"zod" | "native"`. |
| `downloadSpec` | function | Downloads and caches the core FHIR spec for a version. |
| `downloadIG` | function | Downloads an IG package from `packages.fhir.org`. |
| `loadLocalSpec` | function | Load a pre-downloaded spec from disk (air-gapped CI). |
| `parseStructureDefinition` | function | Turn an SD resource into a `ResourceModel`. |
| `parseProfile` | function | Parse a profile SD into a `ProfileModel`. |
| `parseSearchParameters` | function | Build a per-resource `ResourceSearchParams` map from raw `SearchParameter` resources. |
| `ProfileModel` | type | Parsed profile with constraints, bindings, extensions. |
| `ResourceModel` | type | Parsed resource with properties, backbones, and search params. |
| `BackboneElementModel` | type | Nested backbone type. |
| `PropertyModel` | type | `{ name, typeRef, cardinality, binding?, polymorphic? }`. |
| `ResourceSearchParams` | type | `Record<string, SearchParamModel>`. |
| `SearchParamModel` | type | `{ name, type, expression, composite?, multipleOr?, multipleAnd? }`. |

## API

### `generate`
**Signature**
```ts
function generate(options: GeneratorOptions): Promise<void>;

interface GeneratorOptions {
  version: string;                                  // "r4" | "r4b" | "r5" | "r6"
  outDir: string;
  resources?: string[];                             // filter by resource name (default: all)
  cacheDir?: string;
  localSpecDir?: string;                            // short-circuits downloadSpec
  ig?: string[];                                    // IG packages; "name@version" or "name#version"
  expandValueSets?: boolean;                        // inline VS expansions into type unions
  resolveCodeSystems?: boolean;                     // emit CodeSystem namespace objects
  includeSpec?: boolean;                            // copy raw SDs into outDir
  validator?: ValidatorTarget;                      // "zod" | "native"
  strictExtensible?: boolean;                       // treat `extensible` bindings as closed
}
type ValidatorTarget = "zod" | "native";
```
**Parameters** — See `GeneratorOptions`. `version` and `outDir` are required.

**Returns** — Resolves once all files have been written; throws on download or emit failure.

**Example**
```ts
import { generate } from "@fhir-dsl/generator";

await generate({
  version: "r4",
  outDir: "./src/fhir/r4",
  ig: ["hl7.fhir.us.core@6.1.0"],
  validator: "zod",
  expandValueSets: true,
  resolveCodeSystems: true,
});
```

**Notes**
- `localSpecDir` short-circuits `downloadSpec`; the `cacheDir` default is `<outDir>/.cache`.
- `strictExtensible: true` will break conformance with servers that emit codes outside the declared VS; use only for vendors that enforce strict terminology.
- Dual validator emitters: `"native"` is zero-dependency (Standard Schema v1 only); `"zod"` requires `zod` as a runtime dep but gives you the full zod ecosystem.

---

### `downloadSpec` / `downloadIG` / `loadLocalSpec`
**Signature**
```ts
function downloadSpec(
  version: string,
  cacheDir: string,
  options?: { expandValueSets?: boolean; fetch?: typeof globalThis.fetch },
): Promise<DownloadedSpec>;

function downloadIG(packageRef: string, cacheDir: string): Promise<DownloadedIG>;

function loadLocalSpec(dir: string): Promise<DownloadedSpec>;
```
**Parameters**
- `version` — `"r4"`, `"r4b"`, `"r5"`, `"r6"`. R6 is scaffolded in the URL map but not fully supported.
- `cacheDir` — Disk location for downloaded tarballs and extracted JSON; hits are reused on subsequent runs.
- `packageRef` — IG reference, either `name@version` (npm) or `name#version` (FHIR registry).

**Returns** — The parsed spec / IG, with `resourceDefinitions`, `searchParameters`, `valueSets`, and `codeSystems` available to the emitter.

**Example**
```ts
import { downloadSpec, downloadIG } from "@fhir-dsl/generator";

const spec = await downloadSpec("r4", ".cache/fhir");
const usCore = await downloadIG("hl7.fhir.us.core@6.1.0", ".cache/ig");
```

**Notes** — `downloadIG` fetches from `https://packages.fhir.org/<name>/<version>` and extracts tar+gzip in-process (no external `tar` dep), keeping the CLI lean for CI images.

---

### `SpecCatalog`
**Behavior** — The `SpecCatalog` (built internally from a `DownloadedSpec`) is the single source of truth for type resolution across the emitter: primitives, complex types, base types, reference-target inference, and common search params all pull from one catalog. Per-IG profiles slot in cleanly because profile parsing consults the same catalog.

**Notes** — The catalog itself is an internal data structure; it's not part of the public export surface, but understanding that every emitter pulls from one place explains why `--ig` precedence works the way it does (later IGs override earlier catalog entries on name conflicts).

---

### Parsers — `parseStructureDefinition`, `parseProfile`, `parseSearchParameters`
**Signature**
```ts
function parseStructureDefinition(sd: StructureDefinition, catalog: SpecCatalog): ResourceModel;
function parseProfile(sd: StructureDefinition, igName: string, catalog: SpecCatalog): ProfileModel;
function parseSearchParameters(params: SearchParameter[]): Record<string, ResourceSearchParams>;
```
**Parameters**
- `sd` — A FHIR `StructureDefinition` resource.
- `catalog` — The shared `SpecCatalog` (produced internally during `generate()`).
- `igName` — The owning IG package identifier.
- `params` — Raw `SearchParameter` resources (already filtered to the desired resources).

**Returns**
- `ResourceModel` — flat `{ name, properties: PropertyModel[], backbones: BackboneElementModel[], searchParams: ResourceSearchParams }`.
- `ProfileModel` — narrowed snapshot (constraints, bindings, extensions).
- `parseSearchParameters` — a per-resource map of `SearchParamModel` entries keyed by param name.

**Example**
```ts
import { parseStructureDefinition } from "@fhir-dsl/generator";
// Usually run inside a custom emitter — consult generator.ts for wiring.
```

---

### Model types
**Signature**
```ts
interface PropertyModel {
  name: string;
  typeRef: TypeRef;
  cardinality: { min: number; max: number | "*" };
  binding?: { strength: "required" | "extensible" | "preferred" | "example"; valueSet?: string };
  polymorphic?: boolean;
}
interface BackboneElementModel { /* nested backbone type */ }
interface ResourceModel { /* parsed resource with properties + backbones */ }
interface SearchParamModel {
  name: string;
  type: "string" | "token" | "date" | "reference" | "quantity" | "number" | "uri" | "composite" | "special";
  expression: string;
  composite?: unknown;
  multipleOr?: boolean;
  multipleAnd?: boolean;
}
type ResourceSearchParams = Record<string, SearchParamModel>;
```
