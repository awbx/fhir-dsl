export interface PropertyModel {
  name: string;
  types: TypeRef[];
  isRequired: boolean;
  isArray: boolean;
  isChoiceType: boolean;
  description?: string | undefined;
}

export interface TypeRef {
  code: string;
  targetProfiles?: string[] | undefined;
}

export interface ResourceModel {
  name: string;
  url: string;
  kind: "resource" | "complex-type" | "primitive-type";
  isAbstract: boolean;
  baseType?: string | undefined;
  properties: PropertyModel[];
  backboneElements: BackboneElementModel[];
  description?: string | undefined;
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
  description?: string | undefined;
  expression?: string | undefined;
  targets?: string[] | undefined;
}

export interface ResourceSearchParams {
  resourceType: string;
  params: SearchParamModel[];
}
