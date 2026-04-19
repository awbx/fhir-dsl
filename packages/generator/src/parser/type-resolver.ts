import type { TypeRef } from "../model/resource-model.js";
import type { TypeMapper } from "../spec/type-mapping.js";

export interface ResolvedType {
  tsType: string;
  needsImport: boolean;
  importFrom: "primitives" | "datatypes" | "resources" | null;
}

export function resolveType(typeRef: TypeRef, mapper: TypeMapper): ResolvedType {
  const { code, targetProfiles } = typeRef;

  if (code === "Reference" && targetProfiles?.length) {
    const targets = targetProfiles.map((t) => `"${t}"`).join(" | ");
    return {
      tsType: `Reference<${targets}>`,
      needsImport: true,
      importFrom: "datatypes",
    };
  }

  if (code === "Reference") {
    return { tsType: "Reference", needsImport: true, importFrom: "datatypes" };
  }

  if (mapper.isPrimitive(code)) {
    return {
      tsType: mapper.fhirTypeToTs(code),
      needsImport: true,
      importFrom: "primitives",
    };
  }

  if (mapper.isComplexType(code)) {
    return {
      tsType: mapper.fhirTypeToTs(code),
      needsImport: true,
      importFrom: "datatypes",
    };
  }

  return { tsType: code, needsImport: true, importFrom: "resources" };
}

export function resolveTypesUnion(
  typeRefs: TypeRef[],
  mapper: TypeMapper,
): { tsType: string; resolvedTypes: ResolvedType[] } {
  const resolved = typeRefs.map((t) => resolveType(t, mapper));
  const tsType = resolved.map((r) => r.tsType).join(" | ");
  return { tsType, resolvedTypes: resolved };
}
