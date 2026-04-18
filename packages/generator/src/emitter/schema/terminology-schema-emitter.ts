import type { ResolvedValueSet } from "@fhir-dsl/terminology";
import type { BindingTypeMap } from "../terminology-emitter.js";
import type { SchemaNode, ValidatorAdapter } from "./adapter.js";

/**
 * Emit enum schemas for every ValueSet that was resolved into a TS type.
 * Same sanitized name as terminology-emitter, suffixed with `Schema`.
 */
export function emitTerminologySchemas(
  resolvedValueSets: ResolvedValueSet[],
  bindingTypeMap: BindingTypeMap,
  adapter: ValidatorAdapter,
  options?: { runtimePath?: string | undefined },
): string {
  // Build reverse map typeName → codes so we only emit names that made it into
  // the generated terminology.ts types (i.e. passed terminology-emitter's filters).
  const nameToCodes = new Map<string, string[]>();
  for (const vs of resolvedValueSets) {
    const name = bindingTypeMap.get(vs.url);
    if (!name) continue;
    if (nameToCodes.has(name)) continue;
    if (vs.codes.length === 0) continue;
    nameToCodes.set(
      name,
      vs.codes.map((c) => c.code),
    );
  }

  const names = [...nameToCodes.keys()].sort();

  const body: string[] = [adapter.libImport({ runtimePath: options?.runtimePath ?? "./__runtime.js" }), ""];
  for (const name of names) {
    const codes = nameToCodes.get(name)!;
    const node: SchemaNode = { kind: "enum", values: codes, extensible: false };
    body.push(adapter.declareConst(`${name}Schema`, node));
  }
  body.push("");

  return `${body.join("\n")}\n`;
}
