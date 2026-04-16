import type { ResolvedValueSet } from "@fhir-dsl/terminology";

/**
 * Map from ValueSet URL → generated TypeScript type name.
 * Used by the resource emitter to parameterize FhirCode / CodeableConcept / Coding.
 */
export type BindingTypeMap = Map<string, string>;

export interface TerminologyEmitResult {
  /** TypeScript source for valuesets.ts */
  valueSetsSource: string;
  /** TypeScript source for codesystems.ts */
  codeSystemsSource: string;
  /** TypeScript source for index.ts */
  indexSource: string;
  /** Map from ValueSet URL → generated type name */
  bindingTypeMap: BindingTypeMap;
}

/**
 * Emits terminology type aliases and const objects from resolved ValueSets.
 *
 * For `required` bindings: closed literal union (e.g., `"male" | "female" | ...`)
 * For `extensible` bindings: open literal union with `(string & {})` for autocomplete
 */
export function emitTerminology(resolvedValueSets: ResolvedValueSet[]): TerminologyEmitResult {
  const bindingTypeMap: BindingTypeMap = new Map();
  const vsLines: string[] = [];
  const csLines: string[] = [];

  // Sort by name for deterministic output
  const sorted = [...resolvedValueSets].sort((a, b) => a.name.localeCompare(b.name));

  for (const vs of sorted) {
    if (vs.codes.length === 0) continue;

    const typeName = vs.name;
    bindingTypeMap.set(vs.url, typeName);

    // Emit type alias (literal union)
    const codeUnion = vs.codes.map((c) => `"${escapeString(c.code)}"`).join(" | ");
    vsLines.push(`export type ${typeName} = ${codeUnion};`);

    // Emit const namespace object (for IntelliSense / code completion)
    csLines.push(`export const ${typeName} = {`);
    for (const code of vs.codes) {
      const key = codeToPascalKey(code.code);
      csLines.push(`  ${key}: "${escapeString(code.code)}" as const,`);
    }
    csLines.push("} as const;");
    csLines.push("");
  }

  const valueSetsSource = vsLines.length > 0 ? `${vsLines.join("\n")}\n` : "";
  const codeSystemsSource = csLines.length > 0 ? `${csLines.join("\n")}\n` : "";

  const indexLines: string[] = [];
  if (valueSetsSource) indexLines.push('export * from "./valuesets.js";');
  if (codeSystemsSource) indexLines.push('export * from "./codesystems.js";');
  const indexSource = indexLines.length > 0 ? `${indexLines.join("\n")}\n` : "";

  return { valueSetsSource, codeSystemsSource, indexSource, bindingTypeMap };
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Convert a FHIR code to a valid PascalCase JS identifier for const namespace keys.
 * e.g., "not-present" → "NotPresent", "active" → "Active", "=" → "Equals"
 */
function codeToPascalKey(code: string): string {
  // Handle special characters
  const cleaned = code
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : ""))
    .join("");

  if (cleaned.length === 0) return `_${code.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Ensure starts with a letter
  if (/^[0-9]/.test(cleaned)) return `_${cleaned}`;

  return cleaned;
}
