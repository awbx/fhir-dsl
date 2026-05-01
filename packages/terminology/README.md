# @fhir-dsl/terminology

Compile-time FHIR terminology resolver. Loads pre-expanded ValueSets and CodeSystems from a FHIR spec or Implementation Guide, resolves bindings (required / extensible / preferred / example) by strength, and walks CodeSystem hierarchies (`is-a`, `descendent-of`, `regex` filters with transitive subsumption).

This is the engine behind `@fhir-dsl/cli generate --expand-valuesets` / `--resolve-codesystems`. Most users never import it directly — install standalone only when you need the same resolver outside the generator (e.g. a custom binding-strength linter or an offline `validate-code` runner).

## Install

```bash
npm install @fhir-dsl/terminology
```

## Usage

### Resolve a ValueSet from a parsed bundle

```ts
import {
  TerminologyRegistry,
  parseCodeSystem,
  parseExpansionsBundle,
  resolveValueSet,
} from "@fhir-dsl/terminology";

const registry = new TerminologyRegistry();
parseExpansionsBundle(expansionsBundleJson, registry);
parseCodeSystem(codeSystemJson, registry);

const vs = resolveValueSet(
  "http://hl7.org/fhir/ValueSet/administrative-gender",
  registry,
);
// vs?.codes: ResolvedCode[] — { code, display?, system, definition? }
```

### Walk a CodeSystem hierarchy

`TerminologyRegistry` exposes the parsed CodeSystem graph for transitive subsumption (`is-a` + `descendent-of` filters). The generator uses it to expand `compose.include[].filter` against in-house concept trees without needing a live terminology server.

```ts
import { resolveCompose } from "@fhir-dsl/terminology";

// resolveCompose handles the full ValueSet.compose grammar:
// - include.system + include.concept[]
// - include.system + include.filter[].op (= "is-a" | "descendent-of" | "regex" | "in" | "not-in" | "exists")
// - include.valueSet[]
// - exclude.* (subtracts from the union)
const codes = resolveCompose(compose, registry);
```

## Coverage

- **Bindings by strength** — `required`, `extensible`, `preferred`, `example`. The generator narrows enums for `required` (and `extensible` under `--strict-extensible`); `preferred` / `example` keep the open `string` type.
- **CodeSystem filters** — `is-a` and `descendent-of` walk transitive `concept.concept[]` hierarchies; `regex` matches `code` against the supplied pattern; `in` / `not-in` membership checks; `exists` against `concept.property[]`.
- **Pre-expanded ValueSets** — when a ValueSet ships an `expansion.contains[]` block, that wins over `compose` (matches the FHIR spec's hint that pre-expansion is authoritative).

## What's not in scope

- **Live `$expand` / `$validate-code` against a remote server** — that lives in `@fhir-dsl/core` (`client.terminology.*`). This package is purely offline.
- **SNOMED post-coordination, LOINC parts** — out of scope; treat them as opaque codes.

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
