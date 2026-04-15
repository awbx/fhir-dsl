import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirDecimal, FhirString } from "../primitives.js";

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
  performer?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device">;
  reason?: CodeableReference[];
  basis?: Reference<"Resource">[];
  prediction?: RiskAssessmentPrediction[];
  mitigation?: FhirString;
  note?: Annotation[];
}
