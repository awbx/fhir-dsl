import type { FhirCode, FhirDateTime, FhirDecimal, FhirString } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Range, Reference } from "../datatypes.js";

export interface RiskAssessmentPrediction extends BackboneElement {
  outcome?: CodeableConcept;
  probabilityDecimal?: FhirDecimal;
  probabilityRange?: Range;
  qualitativeRisk?: CodeableConcept;
  relativeRisk?: FhirDecimal;
  whenPeriod?: Period;
  whenRange?: Range;
  rationale?: FhirString;
}

export interface RiskAssessment extends DomainResource {
  resourceType: "RiskAssessment";
  identifier?: Identifier[];
  basedOn?: Reference<"Resource">;
  parent?: Reference<"Resource">;
  status: FhirCode;
  method?: CodeableConcept;
  code?: CodeableConcept;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  condition?: Reference<"Condition">;
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Device">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  basis?: Reference<"Resource">[];
  prediction?: RiskAssessmentPrediction[];
  mitigation?: FhirString;
  note?: Annotation[];
}
