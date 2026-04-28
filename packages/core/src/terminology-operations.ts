// Phase 3.1 — typed terminology operations.
//
// The FHIR Terminology Service spec defines a fixed set of operations
// on `ValueSet`, `CodeSystem`, and `ConceptMap` resources:
//
//   - $expand        (ValueSet)
//   - $validate-code (ValueSet or CodeSystem)
//   - $lookup        (CodeSystem)
//   - $translate     (ConceptMap)
//   - $subsumes      (CodeSystem)
//
// Each accepts a well-defined parameter set. Until now consumers had to
// reach for the generic `client.operation("$expand", ...)` and pass an
// untyped `Parameters` body. This module exposes a typed namespace
// (`client.terminology`) where every operation is a strongly-typed
// builder around the existing `OperationBuilder` machinery.
//
// Output shapes are intentionally `Resource | Parameters` — the spec
// allows servers to return either form depending on operation.

import type { Parameters, Resource } from "@fhir-dsl/types";
import { type OperationBuilder, OperationBuilderImpl } from "./operation-builder.js";
import type { Executor } from "./search-query-builder.js";

export interface ExpandParams {
  /** Canonical URL of the ValueSet to expand. */
  url?: string;
  /** Specific ValueSet version to expand against. */
  valueSetVersion?: string;
  /** Inline ValueSet to expand (alternative to `url`). */
  valueSet?: Resource;
  /** Text filter applied to display strings. */
  filter?: string;
  /** Limit the number of returned codes. */
  count?: number;
  /** Pagination offset. */
  offset?: number;
  /** Include designations / translations in the expansion. */
  includeDesignations?: boolean;
  /** Restrict to currently-active codes only. */
  activeOnly?: boolean;
  /** Preferred language for display strings (BCP-47). */
  displayLanguage?: string;
  /** Treat date as the snapshot point for the expansion. */
  date?: string;
}

export interface ValidateCodeParams {
  /** URL of the ValueSet (or CodeSystem when calling on CodeSystem). */
  url?: string;
  /** Specific version of the ValueSet/CodeSystem. */
  valueSetVersion?: string;
  /** Code to validate. */
  code: string;
  /** Code system the code belongs to. Required when validating against a ValueSet that draws from multiple systems. */
  system?: string;
  /** Optional display string to validate against the canonical display. */
  display?: string;
  /** Validate as a Coding rather than (system, code, display) triple. */
  coding?: { system?: string; code: string; display?: string };
  /** Validate as a CodeableConcept. */
  codeableConcept?: { coding?: Array<{ system?: string; code: string; display?: string }> };
  /** Inline ValueSet (alternative to `url`). */
  valueSet?: Resource;
}

export interface LookupParams {
  code: string;
  system: string;
  version?: string;
  /** Optional list of property URIs to return. */
  property?: string[];
  displayLanguage?: string;
}

export interface TranslateParams {
  /** Canonical URL of the ConceptMap to apply. */
  url?: string;
  /** Source code to translate. */
  code: string;
  /** Source code system. */
  system: string;
  /** Source code system version. */
  version?: string;
  /** Target ValueSet for the translation. */
  target?: string;
  /** Target code system if no ValueSet is specified. */
  targetSystem?: string;
  /** Reverse the translation direction. */
  reverse?: boolean;
}

export interface SubsumesParams {
  codeA: string;
  codeB: string;
  system: string;
  version?: string;
}

/**
 * Typed terminology-operations namespace. Returned by
 * `client.terminology` — each method returns an `OperationBuilder` that
 * is `compile()`-able and `execute()`-able just like
 * `client.operation(...)`.
 */
export class TerminologyClient {
  readonly #executor: Executor;

  constructor(executor: Executor) {
    this.#executor = executor;
  }

  expand(params: ExpandParams): OperationBuilder {
    const { valueSet, ...rest } = params;
    return new OperationBuilderImpl(this.#executor, "$expand", {
      scope: { kind: "type", resourceType: "ValueSet" },
      parameters: paramsWithResource(rest, valueSet ? { name: "valueSet", value: valueSet } : undefined),
    });
  }

  validateCode(params: ValidateCodeParams & { _on?: "ValueSet" | "CodeSystem" }): OperationBuilder {
    const { valueSet, coding, codeableConcept, _on, ...rest } = params;
    const scope: "ValueSet" | "CodeSystem" = _on ?? "ValueSet";
    const extras: Array<{ name: string; value: unknown }> = [];
    if (valueSet) extras.push({ name: "valueSet", value: valueSet });
    if (coding) extras.push({ name: "coding", value: coding });
    if (codeableConcept) extras.push({ name: "codeableConcept", value: codeableConcept });
    return new OperationBuilderImpl(this.#executor, "$validate-code", {
      scope: { kind: "type", resourceType: scope },
      parameters: paramsWithResource(rest, ...extras),
    });
  }

  lookup(params: LookupParams): OperationBuilder {
    const { property, ...rest } = params;
    const extras = (property ?? []).map((p) => ({ name: "property", value: p }));
    return new OperationBuilderImpl(this.#executor, "$lookup", {
      scope: { kind: "type", resourceType: "CodeSystem" },
      parameters: paramsWithResource(rest, ...extras),
    });
  }

  translate(params: TranslateParams): OperationBuilder {
    return new OperationBuilderImpl(this.#executor, "$translate", {
      scope: { kind: "type", resourceType: "ConceptMap" },
      parameters: paramsWithResource(params),
    });
  }

  subsumes(params: SubsumesParams): OperationBuilder {
    return new OperationBuilderImpl(this.#executor, "$subsumes", {
      scope: { kind: "type", resourceType: "CodeSystem" },
      parameters: paramsWithResource(params),
    });
  }
}

/**
 * Builds a `Parameters` resource from a plain record, plus optional
 * extras (already-shaped parameter entries with raw `value` payloads).
 * The base operation builder handles primitive wrapping; we just
 * delegate to it once the body is shaped.
 */
function paramsWithResource(
  rest: Record<string, unknown>,
  ...extras: Array<{ name: string; value: unknown } | undefined>
): Parameters {
  const parameter: Parameters["parameter"] = [];
  for (const [name, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;
    parameter.push(buildEntry(name, value));
  }
  for (const e of extras) {
    if (!e) continue;
    parameter.push(buildEntry(e.name, e.value));
  }
  return { resourceType: "Parameters", parameter };
}

function buildEntry(name: string, value: unknown): Parameters["parameter"][number] {
  if (value != null && typeof value === "object" && "resourceType" in (value as object)) {
    return { name, resource: value as Resource };
  }
  if (typeof value === "string") return { name, valueString: value };
  if (typeof value === "boolean") return { name, valueBoolean: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { name, valueInteger: value } : { name, valueDecimal: value };
  }
  // Fallback for nested objects (Coding, CodeableConcept etc.) — wrap as part with sub-parameters.
  if (value != null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return { name, part: entries.map(([k, v]) => buildEntry(k, v)) } as Parameters["parameter"][number];
  }
  return { name, valueString: String(value) };
}
