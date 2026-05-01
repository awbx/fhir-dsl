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

### Emit markdown spec alongside types

Pass `includeSpec: true` to write a parallel `spec/` tree (`resources/*.md`, `profiles/*.md`, `index.md`) summarizing every emitted resource. Built from the same `StructureDefinition` data used for code generation — no extra network calls — and intended as context for AI assistants working against the generated types.

```ts
await generate({
  version: "r4",
  outDir: "./src/fhir",
  resources: ["Patient", "Observation"],
  includeSpec: true,
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

### Emit a runnable MCP server alongside the typed client

Pass `mcp: { outDir }` (or `--mcp <dir>` from the CLI) to scaffold a full MCP server next to the generated types — `server.ts` shim, `mcp.config.json` seeded with the IG's resource types, and a README. Launch it with `FHIR_BASE_URL=… node mcp-server/server.ts`.

```ts
await generate({
  version: "r4",
  outDir: "./src/fhir",
  igs: ["hl7.fhir.us.core@6.1.0"],
  mcp: { outDir: "./mcp-server" },
});
```

### Standard Schema validators with auto-wired invariants

Pass `validator: "native" | "zod"` to emit Standard Schema V1 validators for every resource, datatype, binding, and profile. From v0.49.0 onward, every emitted schema with `ElementDefinition.constraint[*]` is wrapped in `s.refine(...)` (native) or `.superRefine(...)` (zod) that calls `validateInvariants` after structural validation succeeds — so `.validate()` rejects resources that pass the shape check but fail an invariant. Opt out with `noInvariants: true`. Generated projects need `@fhir-dsl/fhirpath` as a runtime dependency when invariants are wired.

```ts
await generate({
  version: "r4",
  outDir: "./src/fhir",
  validator: "native",          // or "zod"
  strictExtensible: false,      // treat extensible bindings as open (default) vs. closed
  // noInvariants: true,        // optional: skip the FHIRPath invariant wiring
});
```

### Boolean-existence search-param emitter (v1.0.1, fixes #45)

When a search parameter's expression matches the `<X>.exists() and <X> != false` pattern (FHIR's idiomatic "is the boolean true?" shape — used by `Patient.active`, `Account.active`, …), the emitter now narrows the typed value to `TokenParam<"true" | "false">` instead of leaving it as a free-form token. Round-trip with `.where("active", "eq", "true")` is type-safe.

### Profile slice → typed extension narrowing (v1.0.1, fixes #46)

Profiles are emitted with an `ExtensionTypeMap` so slice fields whose `type[].profile` references a generated `Extension<URL>` interface are narrowed to that exact branded interface. For example, US Core Patient's `extension_usCoreRace?` is typed as `Extension<"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race">`, not the open `Extension` union — the `.value[x]` payload, the `.url` constant, and any nested slices come along for the ride.

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
  schemas/           # Standard Schema validators (when validator is set)
  spec/              # Markdown spec files (when includeSpec: true)
  client.ts          # Pre-configured FhirClient type with typed createClient()
```

When `mcp: { outDir }` is also set:

```
mcp-server/
  server.ts          # Runnable MCP shim that calls createServer({ ... })
  mcp.config.json    # IG-seeded config (resource-type allowlist, defaults)
  README.md          # Launch instructions
```

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
