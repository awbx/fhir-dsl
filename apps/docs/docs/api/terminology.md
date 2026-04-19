---
sidebar_position: 7
title: "@fhir-dsl/terminology"
description: "In-process CodeSystem / ValueSet parsing and compose resolution — parses `$expand` responses, resolves bindings, and supports `$validate-code`-style lookups."
---

# @fhir-dsl/terminology

## Overview
`@fhir-dsl/terminology` parses FHIR terminology resources (`CodeSystem`, `ValueSet`) and resolves ValueSet compose/expand structures into a flat `{ system, code, display? }` list — all in-process, no terminology-server callout. `TerminologyRegistry` is the high-level entry point: load expansions, code systems, and value sets, call `resolveAll()`, then `resolve(url)` returns the flattened codes with a `|version` strip fallback. Underneath, `resolveCompose` evaluates `include` / `exclude` blocks against a `codeSystemLookup` callback.

## Installation
```bash
npm install @fhir-dsl/terminology
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `TerminologyRegistry` | class | In-memory registry for CodeSystems, ValueSets, and expansions. |
| `parseCodeSystem` | function | Parse a raw `CodeSystem` resource into a `CodeSystemModel`. |
| `parseExpansion` | function | Parse a `ValueSet` carrying an `expansion` block. |
| `parseExpansionsBundle` | function | Parse a Bundle of expansion responses into `ResolvedValueSet[]`. |
| `resolveValueSet` | function | Resolve one ValueSet against loaded expansions and CodeSystems. |
| `resolveCompose` | function | Evaluate `ValueSet.compose.include`/`exclude` against a CodeSystem lookup. |
| `CodeSystemModel` | interface | `{ url, version?, codes: ResolvedCode[] }`. |
| `ResolvedCode` | interface | `{ system, code, display? }`. |
| `ResolvedValueSet` | interface | `{ url, version?, codes: ResolvedCode[] }`. |

## API

### `TerminologyRegistry`
**Signature**
```ts
class TerminologyRegistry {
  loadExpansions(entries: unknown[]): void;               // accepts a bundle's entries or an array of VS+expansion
  loadCodeSystem(resource: unknown): void;
  loadValueSet(resource: unknown): void;
  resolveAll(): void;                                     // materialise every loaded VS into the resolved index
  resolve(url: string): ResolvedValueSet | undefined;     // with `|version` strip fallback
  allResolved(): IterableIterator<ResolvedValueSet>;
  get resolvedCount(): number;
  get codeSystemCount(): number;
}
```
**Parameters**
- `entries` — Usually `Bundle.entry` from an `$expand` aggregation response; each element should be a ValueSet resource with an `expansion` block.
- `resource` — A single `CodeSystem` or `ValueSet` resource.

**Returns** — `resolve(url)` returns the flattened list for a ValueSet, trying the exact URL first and falling back to the URL with `|version` stripped.

**Example**
```ts
import { TerminologyRegistry } from "@fhir-dsl/terminology";

const reg = new TerminologyRegistry();
reg.loadExpansions(expansionsBundle.entry ?? []);
reg.loadCodeSystem(loincCodeSystem);
reg.loadValueSet(labObservationsValueSet);
reg.resolveAll();

const vs = reg.resolve("http://example.org/fhir/ValueSet/lab-observations");
for (const c of vs?.codes ?? []) console.log(c.system, c.code, c.display);
```

**Notes** — `resolve` tries the exact URL, then strips a trailing `|version` and retries — matches terminology-service behaviour where clients sometimes omit versions.

---

### `parseCodeSystem` / `parseExpansion` / `parseExpansionsBundle`
**Signature**
```ts
function parseCodeSystem(resource: unknown): CodeSystemModel | undefined;
function parseExpansion(resource: unknown): ResolvedValueSet | undefined;
function parseExpansionsBundle(bundle: unknown): ResolvedValueSet[];
```
**Example**
```ts
import { parseExpansion } from "@fhir-dsl/terminology";

const resolved = parseExpansion({
  resourceType: "ValueSet",
  url: "http://loinc.org/vs/vitals",
  expansion: {
    contains: [{ system: "http://loinc.org", code: "85353-1", display: "Vital signs" }],
  },
});
// resolved.codes[0] === { system: "http://loinc.org", code: "85353-1", display: "Vital signs" }
```

---

### `resolveValueSet`
**Signature**
```ts
function resolveValueSet(
  resource: unknown,
  expansions: ReadonlyMap<string, ResolvedValueSet>,
  codeSystems: ReadonlyMap<string, CodeSystemModel>,
): ResolvedValueSet | undefined;
```
**Parameters**
- `resource` — A ValueSet resource (with either an `expansion` block or a `compose` block).
- `expansions` — Pre-parsed expansions keyed by URL.
- `codeSystems` — Loaded code systems keyed by URL; used when the VS relies on `compose.include.concept` plus displays from the CS.

**Returns** — A flat `ResolvedValueSet` or `undefined` when nothing could be resolved.

---

### `resolveCompose`
**Signature**
```ts
function resolveCompose(
  resource: unknown,
  codeSystemLookup: (url: string) => CodeSystemModel | undefined,
): ResolvedValueSet | undefined;
```
**Parameters**
- `resource` — A ValueSet resource carrying a `compose` block with `include` / `exclude` entries.
- `codeSystemLookup` — Callback that returns a `CodeSystemModel` for a given CodeSystem URL. All referenced systems must be resolvable in-process (no terminology-server callout).

**Returns** — A `ResolvedValueSet` with duplicate `(system, code)` pairs de-duplicated across includes.

**Example**
```ts
import { resolveCompose } from "@fhir-dsl/terminology";

const vs = resolveCompose(
  {
    resourceType: "ValueSet",
    url: "http://example.org/fhir/ValueSet/vital-signs",
    compose: {
      include: [{ system: "http://loinc.org", concept: [{ code: "85353-1" }, { code: "8310-5" }] }],
    },
  },
  (url) => codeSystems.get(url),
);
```

**Notes** — Filter operators are partially implemented (`=` and `is-a`); consult `valueset-parser.ts` for the supported set. This function does **not** call out to any terminology server — pass a lookup that can serve every referenced CodeSystem in-process.
