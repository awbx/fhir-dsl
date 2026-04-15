export interface PropertyModel {
  name: string;
  types: TypeRef[];
  isRequired: boolean;
  isArray: boolean;
  isChoiceType: boolean;
  description?: string;
}

export interface TypeRef {
  code: string;
  targetProfiles?: string[];
}

export interface ResourceModel {
  name: string;
  url: string;
  kind: "resource" | "complex-type" | "primitive-type";
  isAbstract: boolean;
  baseType?: string;
  properties: PropertyModel[];
  backboneElements: BackboneElementModel[];
  description?: string;
}

export interface BackboneElementModel {
  name: string;
  path: string;
  properties: PropertyModel[];
}

export interface SearchParamModel {
  name: string;
  code: string;
  type: string;
  description?: string;
  expression?: string;
  targets?: string[];
}

export interface ResourceSearchParams {
  resourceType: string;
  params: SearchParamModel[];
}
