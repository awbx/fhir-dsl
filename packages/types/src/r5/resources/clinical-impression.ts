import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface ClinicalImpressionFinding extends BackboneElement {
  item?: CodeableReference;
  basis?: FhirString;
}

export interface ClinicalImpression extends DomainResource {
  resourceType: "ClinicalImpression";
  identifier?: Identifier[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  description?: FhirString;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  date?: FhirDateTime;
  performer?: Reference<"Practitioner" | "PractitionerRole">;
  previous?: Reference<"ClinicalImpression">;
  problem?: Reference<"Condition" | "AllergyIntolerance">[];
  changePattern?: CodeableConcept;
  protocol?: FhirUri[];
  summary?: FhirString;
  finding?: ClinicalImpressionFinding[];
  prognosisCodeableConcept?: CodeableConcept[];
  prognosisReference?: Reference<"RiskAssessment">[];
  supportingInfo?: Reference<"Resource">[];
  note?: Annotation[];
}
