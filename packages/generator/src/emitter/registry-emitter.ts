import { toKebabCase } from "@fhir-dsl/utils";
import type { ResourceModel, ResourceSearchParams } from "../model/resource-model.js";

export function emitRegistry(
  resources: ResourceModel[],
  searchParams: Map<string, ResourceSearchParams>,
  options?: { skipProfileRegistry?: boolean },
): string {
  const lines: string[] = [];
  const sorted = [...resources].sort((a, b) => a.name.localeCompare(b.name));

  for (const r of sorted) {
    const fileName = toKebabCase(r.name);
    lines.push(`import type { ${r.name} } from "./resources/${fileName}.js";`);
  }
  lines.push("");

  const searchParamResources = sorted.filter((r) => searchParams.has(r.name));
  if (searchParamResources.length > 0) {
    const spImports = searchParamResources.map((r) => `${r.name}SearchParams`).join(", ");
    lines.push(`import type { ${spImports} } from "./search-params.js";`);
    lines.push("");
  }

  // FhirResourceMap
  lines.push("export interface FhirResourceMap {");
  for (const r of sorted) {
    lines.push(`  ${r.name}: ${r.name};`);
  }
  lines.push("}");
  lines.push("");

  lines.push("export type ResourceType = keyof FhirResourceMap;");
  lines.push("");

  // SearchParamRegistry
  lines.push("export interface SearchParamRegistry {");
  for (const r of sorted) {
    if (searchParams.has(r.name)) {
      lines.push(`  ${r.name}: ${r.name}SearchParams;`);
    }
  }
  lines.push("}");
  lines.push("");

  // IncludeRegistry (derived from Reference targets in resource properties)
  lines.push("export interface IncludeRegistry {");
  for (const r of sorted) {
    const spEntry = searchParams.get(r.name);
    if (!spEntry) continue;

    const refParams = spEntry.params.filter((p) => p.type === "reference" && p.targets?.length);
    if (refParams.length === 0) continue;

    lines.push(`  ${r.name}: {`);
    for (const param of refParams.sort((a, b) => a.code.localeCompare(b.code))) {
      const targets = param.targets!.map((t) => `"${t}"`).join(" | ");
      lines.push(`    "${param.code}": ${targets};`);
    }
    lines.push("  };");
  }
  lines.push("}");
  lines.push("");

  // RevIncludeRegistry (inverse of IncludeRegistry: target → { source: paramCodes })
  const revIncludeMap = new Map<string, Map<string, Set<string>>>();
  for (const r of sorted) {
    const spEntry = searchParams.get(r.name);
    if (!spEntry) continue;

    const refParams = spEntry.params.filter((p) => p.type === "reference" && p.targets?.length);
    for (const param of refParams) {
      for (const target of param.targets!) {
        if (!revIncludeMap.has(target)) {
          revIncludeMap.set(target, new Map());
        }
        const sourceMap = revIncludeMap.get(target)!;
        if (!sourceMap.has(r.name)) {
          sourceMap.set(r.name, new Set());
        }
        sourceMap.get(r.name)!.add(param.code);
      }
    }
  }

  lines.push("export interface RevIncludeRegistry {");
  const sortedTargets = [...revIncludeMap.keys()].sort();
  for (const target of sortedTargets) {
    const sourceMap = revIncludeMap.get(target)!;
    lines.push(`  ${target}: {`);
    const sortedSources = [...sourceMap.keys()].sort();
    for (const source of sortedSources) {
      const params = [...sourceMap.get(source)!].sort();
      const paramUnion = params.map((p) => `"${p}"`).join(" | ");
      lines.push(`    ${source}: ${paramUnion};`);
    }
    lines.push("  };");
  }
  lines.push("}");
  lines.push("");

  if (!options?.skipProfileRegistry) {
    lines.push("export interface ProfileRegistry {}");
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}
