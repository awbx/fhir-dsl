import type { ResourceModel, ResourceSearchParams } from "../model/resource-model.js";

// Normalizes a FHIRPath expression so it can be used as an auto-dereferencing
// path on `.transform()`. We handle the small slice of FHIRPath that appears
// in real search-parameter definitions; anything funkier (function calls,
// brackets, arithmetic) returns `null` and the emitter omits that param.
//
// Supported reductions:
// - Resource prefix          `Encounter.subject`                → `subject`
// - `.where(...)` suffix     `Encounter.subject.where(...)`     → `subject`
// - `.as(X)` / `.ofType(X)`  `Encounter.subject.as(Reference)`  → `subject`
// - `.resolve()`             `Encounter.subject.resolve()`      → `subject`
// - trailing `.reference`    `Encounter.subject.reference`      → `subject`
// - `|` unions               split, normalize each for the current resource,
//                            skip parts that reference other resources
// - surrounding parens       stripped
//
// Many FHIR common search params have expressions that union across every
// resource the param applies to (e.g. `patient` on Encounter reads
// `AllergyIntolerance.patient | ... | Encounter.subject.where(...) | ...`).
// We only keep the parts that point at the current resource — a single
// cross-resource part that we can't normalize must NOT kill the whole
// emission, otherwise aliases like `patient` silently drop off the
// `includeExpressions` table and `.transform()` can't auto-dereference.
//
// The runtime never sees the resource prefix: it matches activated expressions
// against *canonical dotted paths* taken from the caller's input, which start
// below the primary resource.

export interface NormalizedExpression {
  /** Distinct canonical paths that this param activates. At least one entry. */
  paths: string[];
}

export function normalizeIncludeExpression(expression: string, resourceType: string): NormalizedExpression | null {
  const parts = splitTopLevel(expression, "|");
  const out: string[] = [];
  let anyUnparseable = false;
  for (const part of parts) {
    const one = normalizeOne(part, resourceType);
    if (one === null) {
      // Part either references another resource, or uses a FHIRPath construct
      // we can't reduce. Skip it — other parts of the union may still match.
      anyUnparseable = true;
      continue;
    }
    if (one !== "" && !out.includes(one)) out.push(one);
  }
  if (out.length === 0) {
    // Every part was unparseable. If the input was a single expression rooted
    // at another resource (very common for cross-resource search params), we
    // emit nothing and return null so the emitter skips this param.
    return anyUnparseable ? null : null;
  }
  return { paths: out };
}

function normalizeOne(raw: string, resourceType: string): string | null {
  let s = raw.trim();
  // `.where(...)`, `.as(X)`, `.ofType(X)`, `.resolve()` are common
  // polymorphic-narrowing / filtering hints on reference search params; none
  // of them change the containing field name, which is what we care about for
  // auto-dereferencing. They can appear around *or* after a parenthesized
  // subexpression, so we strip both shapes repeatedly.
  for (;;) {
    const before = s;
    while (s.startsWith("(") && s.endsWith(")") && matchesOuterParens(s)) {
      s = s.slice(1, -1).trim();
    }
    s = stripTrailingCall(s).trim();
    if (s === before) break;
  }
  // Strip a trailing `.reference` — some definitions point at the reference
  // string rather than the containing field.
  if (s.endsWith(".reference")) {
    s = s.slice(0, -".reference".length);
  }
  // Must be a simple dotted path now. Reject anything funky.
  if (!/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s)) return null;

  // Drop the `ResourceType.` prefix if present.
  const prefix = `${resourceType}.`;
  if (s === resourceType) return "";
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length);
  }
  // Expression doesn't start with the primary resource — some SearchParameter
  // definitions target a contained resource (e.g. `Condition.subject`). We
  // only auto-dereference paths rooted at the primary, so skip.
  return null;
}

function stripTrailingCall(s: string): string {
  // Match `foo.where(...)`, `foo.as(X)`, `foo.ofType(X)`, `foo.resolve()`.
  const patterns: { name: string; argPattern?: RegExp }[] = [
    { name: "where" },
    { name: "as" },
    { name: "ofType" },
    { name: "resolve" },
  ];
  for (const { name } of patterns) {
    const marker = `.${name}(`;
    const idx = s.lastIndexOf(marker);
    if (idx === -1) continue;
    // Must terminate at end and parens must balance to the very end.
    const open = idx + marker.length - 1;
    if (!parensCloseAtEnd(s, open)) continue;
    return s.slice(0, idx);
  }
  return s;
}

function parensCloseAtEnd(s: string, openIdx: number): boolean {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i === s.length - 1;
    }
  }
  return false;
}

function matchesOuterParens(s: string): boolean {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0 && i < s.length - 1) return false;
    }
  }
  return depth === 0;
}

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && c === sep) {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out;
}

// ---- Emitter ----

export interface IncludeExpressionsEmission {
  /** TypeScript code for the `IncludeExpressions` interface. */
  typeDecl: string;
  /**
   * TypeScript code for the `includeExpressions` runtime constant. Consumers
   * pass this to `createFhirClient({ includeExpressions })`.
   */
  runtimeDecl: string;
}

export function emitIncludeExpressions(
  resources: ResourceModel[],
  searchParams: Map<string, ResourceSearchParams>,
): IncludeExpressionsEmission {
  const sorted = [...resources].sort((a, b) => a.name.localeCompare(b.name));

  const typeLines: string[] = [];
  typeLines.push("export interface IncludeExpressions {");

  const runtimeEntries: Array<[string, Array<[string, string[]]>]> = [];

  for (const r of sorted) {
    const spEntry = searchParams.get(r.name);
    if (!spEntry) continue;

    const refParams = spEntry.params.filter((p) => p.type === "reference" && p.targets?.length && p.expression);
    if (refParams.length === 0) continue;

    const emittedForThis: Array<[string, string[]]> = [];
    const typeEntries: string[] = [];
    for (const param of [...refParams].sort((a, b) => a.code.localeCompare(b.code))) {
      const normalized = normalizeIncludeExpression(param.expression!, r.name);
      if (!normalized) continue;
      emittedForThis.push([param.code, normalized.paths]);
      const typeValue = normalized.paths.map((p) => `"${p}"`).join(" | ");
      typeEntries.push(`    "${param.code}": ${typeValue};`);
    }

    if (emittedForThis.length === 0) continue;

    typeLines.push(`  ${r.name}: {`);
    typeLines.push(...typeEntries);
    typeLines.push("  };");
    runtimeEntries.push([r.name, emittedForThis]);
  }

  typeLines.push("}");

  const runtimeLines: string[] = [];
  runtimeLines.push("export const includeExpressions: Record<string, Record<string, string | string[]>> = {");
  for (const [resourceName, entries] of runtimeEntries) {
    runtimeLines.push(`  ${resourceName}: {`);
    for (const [paramCode, paths] of entries) {
      const value = paths.length === 1 ? `"${paths[0]}"` : `[${paths.map((p) => `"${p}"`).join(", ")}]`;
      runtimeLines.push(`    "${paramCode}": ${value},`);
    }
    runtimeLines.push("  },");
  }
  runtimeLines.push("};");

  return {
    typeDecl: typeLines.join("\n"),
    runtimeDecl: runtimeLines.join("\n"),
  };
}
