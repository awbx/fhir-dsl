# @fhir-dsl/cli

CLI tool for generating type-safe FHIR TypeScript types from official HL7 specifications and Implementation Guides.

Generates the `FhirSchema` type used by `@fhir-dsl/core` for compile-time query safety.

## Install

```bash
# Global install
npm install -g @fhir-dsl/cli

# Or use with npx
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

## Usage

### Generate types from base FHIR R4

```bash
fhir-gen generate \
  --version r4 \
  --out ./src/fhir
```

### Generate with US Core profiles

```bash
fhir-gen generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

### Generate specific resources only

```bash
fhir-gen generate \
  --version r4 \
  --resources Patient,Observation,Condition \
  --out ./src/fhir
```

### Use a local FHIR definitions directory

```bash
fhir-gen generate \
  --version r4 \
  --src ./local-fhir-definitions \
  --out ./src/fhir
```

### Emit markdown spec for AI assistants

```bash
fhir-gen generate \
  --version r4 \
  --resources Patient,Observation \
  --include-spec \
  --out ./src/fhir
```

Writes a parallel `spec/` tree with one markdown file per resource (and per profile when `--ig` is used), plus an `index.md`. Intended as context for AI coding assistants: they get the properties table, cardinality, terminology bindings, and search parameters in a format that's easy to embed or attach.

## Commands

The `fhir-gen` binary ships six subcommands:

```bash
fhir-gen generate     # generate TypeScript from a FHIR version (+ optional IG)
fhir-gen capability   # snapshot a server's CapabilityStatement
fhir-gen validate     # structurally check a FHIR JSON resource
fhir-gen scaffold-ig  # initialise a starter project with an IG pre-wired
fhir-gen diff         # report breaking changes between two generated outputs
fhir-gen mcp          # launch an MCP server inline against a live FHIR endpoint
```

### `fhir-gen generate`

Generate TypeScript types from FHIR specification.

| Flag | Required | Default | Description |
|---|---|---|---|
| `--version <version>` | Yes | `r4` | FHIR version (`r4`, `r4b`, `r5`, `r6`) |
| `--out <dir>` | Yes | - | Output directory for generated types |
| `--ig <packages...>` | No | - | IG packages to include (e.g., `hl7.fhir.us.core@6.1.0`) |
| `--resources <list>` | No | all | Comma-separated resource names to generate |
| `--src <path>` | No | - | Local path to FHIR definitions (skips download) |
| `--cache <dir>` | No | - | Cache directory for downloaded specs |
| `--validator <target>` | No | - | Emit Standard Schema V1 validators: `native` (zero-dep) or `zod`. Auto-wires `validateInvariants` via `s.refine` / `.superRefine` so structurally valid resources also pass `ElementDefinition.constraint[*]` (v0.49.0+). |
| `--no-invariants` | No | - | Opt out of the invariant wiring above; emits validators that only check structure. |
| `--strict-extensible` | No | `false` | Treat `extensible` ValueSet bindings as closed enums in the emitted validators (default is open). |
| `--expand-valuesets` | No | `false` | Generate typed unions from FHIR ValueSet bindings |
| `--resolve-codesystems` | No | `false` | Generate CodeSystem namespace objects for IntelliSense |
| `--include-spec` | No | `false` | Emit markdown spec files alongside types (for AI/LLM context) |
| `--mcp <dir>` | No | - | Emit a runnable MCP server scaffold (`server.ts`, `mcp.config.json`, `README.md`) alongside the generated types, seeded with the IG's resource types (v0.46.0+). |

### `fhir-gen capability <baseUrl>`

Fetches `<baseUrl>/metadata` and prints a table of supported interactions, formats, search params, and conditional-* flags. `--out <file>` dumps the raw JSON, `--json` prints it to stdout. (v0.32.0.)

### `fhir-gen validate <file>`

Structural sanity-check on a FHIR JSON resource: parses, validates the `resourceType` is known, checks basic invariants (string `id`, `Bundle.entry` is an array, no NaN/Infinity in numbers). Designed for CI gates around LLM-generated payloads. `--quiet` suppresses warnings on success. (v0.35.0.)

### `fhir-gen scaffold-ig <pkg>`

Initialises a starter project with the IG pre-wired. Writes `package.json`, `tsconfig.json`, `fhir-dsl.config.json`, and `src/client.ts` calling the generator's emitted `createClient`. `--out <dir>` (default cwd), `--version <ver>` (default `r4`), `--name <project>`, `--force` to overwrite. (v0.36.0.)

### `fhir-gen diff <oldDir> <newDir>`

Compares two generated outputs and reports added/removed resources, removed fields, optional→required changes, and type narrowing. Exits 2 when breaking changes are detected — wire it into CI to gate FHIR version bumps. `--json` for a machine-readable report. (v0.37.0.)

### `fhir-gen mcp <baseUrl>`

Launches an MCP server inline against a live FHIR endpoint (no generated types required). `--resources Patient,Observation` narrows the verb surface, `--writes create,update` opts into write verbs, `--confirm-writes` requires `{confirm: true}` per call, `--auth-bearer-env FHIR_TOKEN` reads the bearer from the named env var. (v0.47.0.)

## What gets generated

```
out/
  index.ts           # FhirSchema type and re-exports
  primitives.ts      # FHIR primitive types (string, uri, dateTime, etc.)
  datatypes.ts       # Complex datatypes (HumanName, Address, CodeableConcept, etc.)
  registry.ts        # Resource type registry mapping
  search-params.ts   # Typed search parameters per resource
  resources/
    patient.ts       # Patient interface
    observation.ts   # Observation interface
    ...              # One file per resource
  profiles/          # (when --ig is used)
    uscore-patient-profile.ts
    uscore-vital-signs-profile.ts
    ...
  spec/              # (when --include-spec is used)
    index.md
    resources/*.md
    profiles/*.md    # (when --ig is also used)
  client.ts          # Pre-configured FhirClient type
```

The generated `FhirSchema` type wires everything together so that `@fhir-dsl/core` can provide full type safety for queries, includes, and profile narrowing.

## License

[MIT](../../LICENSE)
