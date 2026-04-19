export type PrimitiveKind = "string" | "number" | "integer" | "boolean";

export interface PrimitiveRule {
  kind: PrimitiveKind;
  regex?: RegExp;
  min?: number;
  max?: number;
  maxLength?: number;
}

export interface PrimitiveEntry {
  name: string;
  tsType: string;
  rule: PrimitiveRule;
  fhirpathSystemUrl?: string;
}

export interface ComplexTypeEntry {
  name: string;
  isAbstract: boolean;
}

export type BaseTypeName = "Resource" | "DomainResource" | "Element" | "BackboneElement";

export interface CommonSearchParamEntry {
  code: string;
  type: string;
  scope: "Resource" | "DomainResource";
}

export interface SpecCatalog {
  version: string;
  primitives: Map<string, PrimitiveEntry>;
  complexTypes: Map<string, ComplexTypeEntry>;
  baseProperties: Map<BaseTypeName, Set<string>>;
  commonSearchParams: CommonSearchParamEntry[];
  fhirpathSystemTypes: Map<string, string>;
}
