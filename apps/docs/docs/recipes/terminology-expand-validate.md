---
sidebar_position: 8
title: "Terminology: $expand, $lookup, $validate-code"
description: "Combine ValueSet $expand, CodeSystem $lookup, and $validate-code into a CQL-style code-checking pipeline."
---

# Terminology: $expand, $lookup, $validate-code

## Problem

A decision-support rule says "patient has a diagnosis coded to the
Diabetes ValueSet and an A1C reading above 7%". You need to expand the
ValueSet to know its codes, validate incoming Condition codes against
that set, and look up the LOINC concept to confirm the A1C observation
code. Three operations, one pipeline. The fhir-dsl client exposes all
of them through `client.operation(name, options)` and the terminology
package gives you an in-process fallback when no terminology server is
available.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`, `@fhir-dsl/terminology`
- Server: supports `$expand`, `$lookup`, `$validate-code` (tx.fhir.org
  is the canonical public terminology server; HAPI implements enough
  of it for most bindings)

## Steps

### 1. `$expand` a ValueSet

`$expand` returns a ValueSet with an `expansion.contains` list of the
codes currently in the set. Pass `method: "GET"` to issue a GET with
query string; otherwise POST wraps your primitive params in a
`Parameters` body automatically.

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({ baseUrl: "https://tx.fhir.org/r4" });

type ValueSetExpansion = {
  resourceType: "ValueSet";
  expansion?: { contains?: Array<{ system: string; code: string; display?: string }> };
};

const expansion = await fhir.operation("$expand", {
  scope: { kind: "type", resourceType: "ValueSet" },
  parameters: { url: "http://hl7.org/fhir/ValueSet/administrative-gender" },
  method: "GET",
}).execute() as ValueSetExpansion;

const codes = expansion.expansion?.contains ?? [];
console.log(codes.map((c) => c.code));
```

### 2. `$lookup` a CodeSystem concept

`$lookup` gives you the authoritative display, any designations, and
properties (e.g. LOINC's `COMPONENT`, `PROPERTY`, `TIME_ASPCT`).

```ts
type LookupResponse = {
  resourceType: "Parameters";
  parameter: Array<{ name: string; valueString?: string; valueCoding?: unknown }>;
};

const lookup = await fhir.operation("$lookup", {
  scope: { kind: "type", resourceType: "CodeSystem" },
  parameters: { system: "http://loinc.org", code: "4548-4" },
  method: "GET",
}).execute() as LookupResponse;

const display = lookup.parameter.find((p) => p.name === "display")?.valueString;
console.log("4548-4 =", display); // "Hemoglobin A1c/Hemoglobin.total in Blood"
```

### 3. `$validate-code` against a ValueSet

Ask the terminology server "is this code in this ValueSet?". The answer
is a `Parameters` resource with a `result` boolean and a diagnostics
string when it isn't.

```ts
type ValidateCodeResponse = {
  resourceType: "Parameters";
  parameter: Array<{ name: string; valueBoolean?: boolean; valueString?: string }>;
};

const check = await fhir.operation("$validate-code", {
  scope: { kind: "type", resourceType: "ValueSet" },
  parameters: {
    url: "http://hl7.org/fhir/ValueSet/administrative-gender",
    code: "male",
    system: "http://hl7.org/fhir/administrative-gender",
  },
}).execute() as ValidateCodeResponse;

const result = check.parameter.find((p) => p.name === "result")?.valueBoolean ?? false;
console.log("male is in gender VS:", result);
```

### 4. CQL-style rule check

Combine the three into a decision-support check: "has a diabetes
diagnosis and an A1C above 7". The terminology calls memoize well —
expand the VS once at startup, validate each Condition locally against
the expansion map, fall back to server `$validate-code` only for codes
the local map doesn't know.

```ts
type DiabetesVs = {
  resourceType: "ValueSet";
  expansion?: { contains?: Array<{ system: string; code: string }> };
};

const diabetesVs = await fhir.operation("$expand", {
  scope: { kind: "type", resourceType: "ValueSet" },
  parameters: { url: "http://hl7.org/fhir/us/cqfmeasures/ValueSet/diabetes" },
  method: "GET",
}).execute() as DiabetesVs;

const inVs = new Set(
  (diabetesVs.expansion?.contains ?? []).map((c) => `${c.system}|${c.code}`),
);

async function isInDiabetesVs(system: string, code: string): Promise<boolean> {
  if (inVs.has(`${system}|${code}`)) return true;
  // Fallback for codes emitted past the cached expansion (rare; e.g. new ICD-10 codes)
  const check = await fhir.operation("$validate-code", {
    scope: { kind: "type", resourceType: "ValueSet" },
    parameters: {
      url: "http://hl7.org/fhir/us/cqfmeasures/ValueSet/diabetes",
      system,
      code,
    },
  }).execute() as { parameter: Array<{ name: string; valueBoolean?: boolean }> };
  return check.parameter.find((p) => p.name === "result")?.valueBoolean === true;
}
```

### 5. No terminology server? Use the in-process registry

`@fhir-dsl/terminology` ships a `TerminologyRegistry` that resolves
ValueSet `compose` blocks against CodeSystems you load locally. It does
not call out to the network — handy for air-gapped environments or unit
tests.

```ts
import { TerminologyRegistry } from "@fhir-dsl/terminology";

const reg = new TerminologyRegistry();

reg.loadCodeSystem({
  resourceType: "CodeSystem",
  url: "http://snomed.info/sct",
  content: "fragment",
  concept: [
    { code: "44054006", display: "Diabetes mellitus type 2" },
    { code: "46635009", display: "Diabetes mellitus type 1" },
  ],
});

reg.loadValueSet({
  resourceType: "ValueSet",
  url: "http://example.org/ValueSet/diabetes",
  compose: {
    include: [
      {
        system: "http://snomed.info/sct",
        concept: [{ code: "44054006" }, { code: "46635009" }],
      },
    ],
  },
});

reg.resolveAll();

const vs = reg.resolve("http://example.org/ValueSet/diabetes");
console.log(vs?.codes.map((c) => c.code));
// `resolve()` also accepts `url|version`, falling back to the unversioned URL.
```

## Final snippet

```ts
import { createClient } from "./fhir/r4/client.js";
import { TerminologyRegistry } from "@fhir-dsl/terminology";

const fhir = createClient({
  baseUrl: "https://tx.fhir.org/r4",
  auth: { type: "bearer", credentials: process.env.TX_TOKEN ?? "" },
});

type ExpansionResponse = {
  resourceType: "ValueSet";
  expansion?: { contains?: Array<{ system: string; code: string; display?: string }> };
};
type ParametersResponse = {
  resourceType: "Parameters";
  parameter: Array<{ name: string; valueBoolean?: boolean; valueString?: string }>;
};

export async function expandValueSet(url: string): Promise<Set<string>> {
  const vs = await fhir.operation("$expand", {
    scope: { kind: "type", resourceType: "ValueSet" },
    parameters: { url },
    method: "GET",
  }).execute() as ExpansionResponse;
  return new Set((vs.expansion?.contains ?? []).map((c) => `${c.system}|${c.code}`));
}

export async function validateCode(
  valueSetUrl: string,
  system: string,
  code: string,
): Promise<boolean> {
  const res = await fhir.operation("$validate-code", {
    scope: { kind: "type", resourceType: "ValueSet" },
    parameters: { url: valueSetUrl, system, code },
  }).execute() as ParametersResponse;
  return res.parameter.find((p) => p.name === "result")?.valueBoolean === true;
}

export async function lookupDisplay(
  system: string,
  code: string,
): Promise<string | undefined> {
  const res = await fhir.operation("$lookup", {
    scope: { kind: "type", resourceType: "CodeSystem" },
    parameters: { system, code },
    method: "GET",
  }).execute() as ParametersResponse;
  return res.parameter.find((p) => p.name === "display")?.valueString;
}

export async function offlineRegistry(valueSets: unknown[], codeSystems: unknown[]) {
  const reg = new TerminologyRegistry();
  for (const cs of codeSystems) reg.loadCodeSystem(cs);
  for (const vs of valueSets) reg.loadValueSet(vs);
  reg.resolveAll();
  return reg;
}
```

## Troubleshooting

- **`$expand` returns 10_000 codes** → SNOMED is huge. Add
  `count: 50` and paginate with `offset`, or pass `filter: "diabetes"`
  for text-based narrowing — both go in the `parameters` bag.
- **`$lookup` 404** → the code is in a system the terminology server
  doesn't host. Fall back to the in-process `TerminologyRegistry` with
  a locally loaded CodeSystem.
- **`$validate-code` returns `result: true` but `message` warns** →
  the code is in an `extensible` binding. Accept but surface the
  warning to the user.
- **Need deterministic POST** → operations default to `POST` (with a
  wrapped `Parameters` body). Pass `method: "GET"` only when you are
  sure every parameter is primitive; drop the `method` to force POST.
- **`TerminologyRegistry.resolve(url)` returns `undefined`** → the VS
  references a CodeSystem you didn't load. Load it with
  `reg.loadCodeSystem(...)` and call `reg.resolveAll()` before looking
  up again.
