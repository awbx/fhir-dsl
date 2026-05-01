export interface PropertyModel {
  name: string;
  types: TypeRef[];
  isRequired: boolean;
  isArray: boolean;
  isChoiceType: boolean;
  description?: string | undefined;
  binding?: BindingModel | undefined;
  /** ElementDefinition.constraint[*] declared on this property element. */
  invariants?: InvariantModel[] | undefined;
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
  /** ElementDefinition.constraint[*] from the root element. */
  invariants?: InvariantModel[] | undefined;
}

export interface BackboneElementModel {
  name: string;
  path: string;
  properties: PropertyModel[];
  /** ElementDefinition.constraint[*] from the backbone's root element. */
  invariants?: InvariantModel[] | undefined;
}

export interface InvariantModel {
  /** ElementDefinition.constraint.key (e.g. `pat-1`). */
  key: string;
  severity: "error" | "warning";
  /** Human-readable description used as OperationOutcome diagnostics. */
  human: string;
  /** FHIRPath expression — must yield boolean. */
  expression: string;
}

export interface CompositeComponent {
  /** The code of the component search parameter (e.g. "code", "value-quantity") */
  code: string;
  /** The FHIR search param type of the component (e.g. "token", "quantity") */
  type: string;
}

export interface BindingModel {
  strength: "required" | "extensible" | "preferred" | "example";
  valueSet: string;
}

export interface SearchParamModel {
  name: string;
  code: string;
  type: string;
  description?: string | undefined;
  expression?: string | undefined;
  targets?: string[] | undefined;
  /** For composite params, the ordered list of component search params */
  components?: CompositeComponent[] | undefined;
}

export interface ResourceSearchParams {
  resourceType: string;
  params: SearchParamModel[];
}
