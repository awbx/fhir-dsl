import type { SpecCatalog } from "./catalog.js";

export interface TypeMapper {
  isPrimitive(code: string): boolean;
  isComplexType(code: string): boolean;
  fhirTypeToTs(code: string): string;
}

export function makeTypeMapper(catalog: SpecCatalog): TypeMapper {
  return {
    isPrimitive: (code) => catalog.primitives.has(code),
    isComplexType: (code) => catalog.complexTypes.has(code),
    fhirTypeToTs: (code) => {
      const prim = catalog.primitives.get(code);
      if (prim) return prim.tsType;
      return code;
    },
  };
}
