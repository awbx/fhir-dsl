import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface ConditionDefinitionObservation extends BackboneElement {
  category?: CodeableConcept;
  code?: CodeableConcept;
}

export interface ConditionDefinitionMedication extends BackboneElement {
  category?: CodeableConcept;
  code?: CodeableConcept;
}

export interface ConditionDefinitionPrecondition extends BackboneElement {
  type: FhirCode;
  code: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
}

export interface ConditionDefinitionQuestionnaire extends BackboneElement {
  purpose: FhirCode;
  reference: Reference<"Questionnaire">;
}

export interface ConditionDefinitionPlan extends BackboneElement {
  role?: CodeableConcept;
  reference: Reference<"PlanDefinition">;
}

export interface ConditionDefinition extends DomainResource {
  resourceType: "ConditionDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  code: CodeableConcept;
  severity?: CodeableConcept;
  bodySite?: CodeableConcept;
  stage?: CodeableConcept;
  hasSeverity?: FhirBoolean;
  hasBodySite?: FhirBoolean;
  hasStage?: FhirBoolean;
  definition?: FhirUri[];
  observation?: ConditionDefinitionObservation[];
  medication?: ConditionDefinitionMedication[];
  precondition?: ConditionDefinitionPrecondition[];
  team?: Reference<"CareTeam">[];
  questionnaire?: ConditionDefinitionQuestionnaire[];
  plan?: ConditionDefinitionPlan[];
}
