import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Expression,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface PermissionJustification extends BackboneElement {
  basis?: CodeableConcept[];
  evidence?: Reference<"Resource">[];
}

export interface PermissionRuleDataResource extends BackboneElement {
  meaning: FhirCode;
  reference: Reference<"Resource">;
}

export interface PermissionRuleData extends BackboneElement {
  resource?: PermissionRuleDataResource[];
  security?: Coding[];
  period?: Period[];
  expression?: Expression;
}

export interface PermissionRuleActivity extends BackboneElement {
  actor?: Reference<
    "Device" | "Group" | "CareTeam" | "Organization" | "Patient" | "Practitioner" | "RelatedPerson" | "PractitionerRole"
  >[];
  action?: CodeableConcept[];
  purpose?: CodeableConcept[];
}

export interface PermissionRule extends BackboneElement {
  type?: FhirCode;
  data?: PermissionRuleData[];
  activity?: PermissionRuleActivity[];
  limit?: CodeableConcept[];
}

export interface Permission extends DomainResource {
  resourceType: "Permission";
  status: FhirCode;
  asserter?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "Patient"
    | "RelatedPerson"
    | "HealthcareService"
  >;
  date?: FhirDateTime[];
  validity?: Period;
  justification?: PermissionJustification;
  combining: FhirCode;
  rule?: PermissionRule[];
}
