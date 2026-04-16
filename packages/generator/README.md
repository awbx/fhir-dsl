# @fhir-dsl/generator

FHIR TypeScript code generation engine. Parses HL7 StructureDefinitions and SearchParameters to emit fully typed TypeScript interfaces, search parameter registries, and profile types.

This is the engine behind [`@fhir-dsl/cli`](https://www.npmjs.com/package/@fhir-dsl/cli). Most users should use the CLI directly — install this package only if you're building custom tooling on top of the generator.

## Install

```bash
npm install @fhir-dsl/generator
```

## Usage

### Generate types programmatically

```ts
import { generate } from "@fhir-dsl/generator";

await generate({
  version: "r4",
  outDir: "./src/fhir",
  igs: ["hl7.fhir.us.core@6.1.0"],
});
```

### Load and parse FHIR specs

```ts
import { downloadSpec, downloadIG, loadLocalSpec } from "@fhir-dsl/generator";

// Download from official registry
const spec = await downloadSpec("r4");

// Download an Implementation Guide
const ig = await downloadIG("hl7.fhir.us.core@6.1.0");

// Or load from a local directory
const local = await loadLocalSpec("./fhir-definitions");
```

### Parse individual definitions

```ts
import { parseStructureDefinition, parseProfile, parseSearchParameters } from "@fhir-dsl/generator";

const resource = parseStructureDefinition(structureDef);
const profile = parseProfile(profileDef);
const searchParams = parseSearchParameters(searchParamDefs);
```

## What Gets Generated

```
out/
  index.ts           # FhirSchema type and re-exports
  primitives.ts      # FHIR primitive types
  datatypes.ts       # Complex datatypes
  registry.ts        # Resource type registry
  search-params.ts   # Typed search parameters per resource
  resources/         # One file per resource
  profiles/          # One file per profile (when IGs are included)
  client.ts          # Pre-configured FhirClient type
```

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
