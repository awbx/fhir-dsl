import { fhirTypeToTs, isComplexType, isPrimitive } from "@fhir-dsl/utils";
import type { TypeRef } from "../model/resource-model.js";

export interface ResolvedType {
  tsType: string;
  needsImport: boolean;
  importFrom: "primitives" | "datatypes" | "resources" | null;
}

export function resolveType(typeRef: TypeRef): ResolvedType {
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

  if (isPrimitive(code)) {
    return {
      tsType: fhirTypeToTs(code),
      needsImport: true,
      importFrom: "primitives",
    };
  }

  if (isComplexType(code)) {
    return {
      tsType: fhirTypeToTs(code),
      needsImport: true,
      importFrom: "datatypes",
    };
  }

  return { tsType: code, needsImport: true, importFrom: "resources" };
}

export function resolveTypesUnion(typeRefs: TypeRef[]): { tsType: string; resolvedTypes: ResolvedType[] } {
  const resolved = typeRefs.map(resolveType);
  const tsType = resolved.map((r) => r.tsType).join(" | ");
  return { tsType, resolvedTypes: resolved };
}
